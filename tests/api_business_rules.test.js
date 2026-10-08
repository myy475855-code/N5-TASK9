const request=require("supertest");
process.env.JWT_SECRET="test-secret";
jest.mock("../src/config/db",()=>({query:jest.fn()}));
const db=require("../src/config/db");
const app=require("../src/app");

test("posting limit returns 409 from service rule",async()=>{
  db.query.mockResolvedValueOnce({rows:[{count:5}],rowCount:1});
  const rules=require("../src/services/businessRules");
  process.env.MAX_ACTIVE_POSTINGS="5";
  await expect(rules.assertPostingLimit(1)).rejects.toMatchObject({status:409,code:"POSTING_LIMIT_REACHED"});
});
