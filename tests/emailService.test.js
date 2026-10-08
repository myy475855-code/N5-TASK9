process.env.NODE_ENV = "test";
process.env.RESEND_API_KEY = "test-key";
process.env.EMAIL_TIMEOUT_MS = "20";
process.env.EMAIL_MAX_RETRIES = "2";

const originalFetch = global.fetch;
const { sendEmail } = require("../src/services/emailService");

afterEach(() => { global.fetch = originalFetch; jest.restoreAllMocks(); });

test("email service returns success on provider 200", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: "mail_1" }) });
  const result = await sendEmail({ to: "student@example.com", subject: "Test", html: "Hello" });
  expect(result.sent).toBe(true);
});

test("email service retries a transient provider failure", async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: false, status: 503, text: async () => "busy" })
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: "mail_2" }) });
  const result = await sendEmail({ to: "student@example.com", subject: "Retry", html: "Hello" });
  expect(result.sent).toBe(true);
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test("email service gracefully degrades after repeated failure", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503, text: async () => "busy" });
  const result = await sendEmail({ to: "student@example.com", subject: "Fail", html: "Hello" });
  expect(result.sent).toBe(false);
  expect(global.fetch).toHaveBeenCalledTimes(3);
});
