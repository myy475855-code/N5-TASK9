const crypto = require("crypto");

function sleep(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }

function transient(status){
  return !status || status === 408 || status === 429 || status >= 500;
}

async function sendEmail({to,subject,html,idempotencyKey}){
  const apiKey = process.env.RESEND_API_KEY;
  if(!apiKey){
    console.warn("[EMAIL] RESEND_API_KEY not configured; email skipped.");
    return {sent:false,skipped:true};
  }

  const maxRetries = Math.max(1, Number(process.env.EMAIL_MAX_RETRIES || 3));
  const timeoutMs = Math.max(500, Number(process.env.EMAIL_TIMEOUT_MS || 5000));
  const key = idempotencyKey || crypto.createHash("sha256")
    .update(`${to}|${subject}|${html}`).digest("hex");

  for(let attempt=1; attempt<=maxRetries; attempt++){
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), timeoutMs);

    try {
      const response = await fetch("https://api.resend.com/emails",{
        method:"POST",
        headers:{
          "Authorization":`Bearer ${apiKey}`,
          "Content-Type":"application/json",
          "Idempotency-Key":key
        },
        body:JSON.stringify({
          from:process.env.EMAIL_FROM || "Internship Platform <onboarding@resend.dev>",
          to:[to],
          subject,
          html
        }),
        signal:controller.signal
      });

      clearTimeout(timer);
      const data = await response.json().catch(()=>({}));

      if(response.ok){
        console.log(`[EMAIL] sent to ${to}; provider_id=${data.id || "unknown"}`);
        return {sent:true,id:data.id};
      }

      const err = new Error(`Email provider returned ${response.status}`);
      err.status = response.status;
      err.provider = data;
      if(!transient(response.status) || attempt === maxRetries) throw err;
      console.warn(`[EMAIL] transient failure ${response.status}; retry ${attempt+1}/${maxRetries}`);
    } catch(err){
      clearTimeout(timer);
      if(attempt === maxRetries){
        console.error(`[EMAIL] failed after ${attempt} attempts:`,err.message);
        return {sent:false,error:err.message};
      }
      console.warn(`[EMAIL] attempt ${attempt} failed: ${err.message}; retrying`);
    }

    await sleep(500 * Math.pow(2, attempt-1));
  }
}

module.exports = { sendEmail };
