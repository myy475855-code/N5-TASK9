process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-please-use-long-value";
process.env.MAX_ACTIVE_POSTINGS = "2";

jest.mock("../src/config/db", () => ({ query: jest.fn() }));
const { query } = require("../src/config/db");
const { assertApplicationOpen, assertPostingLimit, closeExpiredInternship } = require("../src/services/businessRules");

describe("business rule unit tests", () => {
  beforeEach(() => jest.clearAllMocks());

  test("deadline check rejects expired internship", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 7, status: "OPEN", application_deadline: new Date(Date.now() - 60000) }] });
    await expect(assertApplicationOpen(7)).rejects.toMatchObject({ code: "APPLICATION_DEADLINE_PASSED", status: 409 });
  });

  test("deadline check accepts open future internship", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 7, status: "OPEN", application_deadline: new Date(Date.now() + 3600000) }] });
    await expect(assertApplicationOpen(7)).resolves.toBeDefined();
  });

  test("posting limit rejects company at configured limit", async () => {
    query.mockResolvedValueOnce({ rows: [{ count: "2" }] });
    await expect(assertPostingLimit(4)).rejects.toMatchObject({ code: "POSTING_LIMIT_REACHED", status: 409 });
  });

  test("posting limit permits company below configured limit", async () => {
    query.mockResolvedValueOnce({ rows: [{ count: "1" }] });
    await expect(assertPostingLimit(4)).resolves.toBeUndefined();
  });

  test("expired posting is closed by closeExpiredInternship", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 9, status: "CLOSED" }] });
    const result = await closeExpiredInternship(9);
    expect(result.status).toBe("CLOSED");
    expect(query).toHaveBeenCalledWith(expect.stringContaining("status='CLOSED'"), [9]);
  });

  test("posting limit uses only OPEN future postings", async () => {
    query.mockResolvedValueOnce({ rows: [{ count: "0" }] });
    await expect(assertPostingLimit(4)).resolves.toBeUndefined();
    expect(query.mock.calls[0][0]).toContain("status='OPEN'");
    expect(query.mock.calls[0][0]).toContain("application_deadline > NOW()");
  });
});
