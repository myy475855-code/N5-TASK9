# TalentBridge Security Audit — Task 7

## Scope and methodology

This audit reviews the TalentBridge internship platform against the OWASP Top 10:2021 categories and focuses on authentication, authorization, application business rules, API exposure, dependency risk, secrets, database access, and frontend behavior. The review used threat modeling, source inspection, automated tests, dependency auditing, and manual API abuse cases.

The primary assets are user credentials, JWTs, student applications, company internship postings, application status, and email/API credentials. Main trust boundaries are: browser → Express API, authenticated user → role-protected endpoint, API → PostgreSQL, and API → Resend.

## Findings and fixes

| OWASP category | Application-specific finding | Severity | Fix / verification |
|---|---|---:|---|
| A01 Broken Access Control | Company application status changes must be restricted to the company owning the internship. | High | Server-side ownership checks remain mandatory; Supertest verifies another company receives **403**. |
| A02 Cryptographic Failures | Passwords must never be stored in plaintext and JWT signing secrets must not be committed. | High | bcrypt hashing, environment-only JWT secret, `.env` ignored; authentication tests verify normal login flow. |
| A03 Injection | Raw SQL exists in the application, so user-controlled values must never be concatenated into SQL. | High | Parameterized `$1, $2...` queries are used throughout controllers/services. Audit explicitly reviewed every application query. |
| A04 Insecure Design | Deadline, posting-limit, and ownership rules must not depend on frontend controls. | High | Business rules execute server-side before database writes; expired application test expects **409**. |
| A05 Security Misconfiguration | Original permissive CORS configuration used `cors()` with no explicit production origin. | Medium | Replaced with explicit `FRONTEND_ORIGIN`; Helmet enabled; Express fingerprinting disabled; body size limited. |
| A06 Vulnerable and Outdated Components | Dependency risk can change after implementation. | Medium | `npm audit --audit-level=high` is required in the submission workflow; lockfile must be committed after install and any high/critical issue remediated or documented. |
| A07 Identification and Authentication Failures | Login endpoints are attractive to brute-force attacks; token validation also needs issuer and expiry checks. | High | `express-rate-limit` protects `/api/auth/login`; JWT uses 2-hour expiry and issuer validation. |
| A08 Software and Data Integrity Failures | External email delivery must not be trusted to succeed and should not break the core transaction. | Medium | Dedicated email service uses timeout, retry/backoff, idempotency key, and graceful failure. |
| A09 Security Logging and Monitoring Failures | Authentication and authorization failures need enough server-side visibility for investigation. | Medium | API errors are normalized and security-sensitive failures can be logged without exposing passwords/tokens. Production logging should be forwarded to a monitored sink. |
| A10 SSRF | The current application does not fetch arbitrary user-supplied URLs. | N/A | No user-controlled server-side URL fetch feature exists. Resend endpoint is fixed configuration, not user input. |

## SQL injection review

All application SQL reviewed for this task uses PostgreSQL parameter placeholders such as `$1`, `$2`, etc. User input is passed separately through the `params` array. No controller constructs a SQL statement by concatenating request values. This design prevents a value such as `' OR 1=1 --` from becoming SQL syntax.

## Authentication / Task 5-6 re-verification

- Password hashing: bcrypt with a work factor of 10–12.
- JWT expiry: 2 hours by default.
- JWT issuer: `talentbridge` and issuer verification on protected routes.
- Role authorization: middleware denies unsupported roles with HTTP 403.
- Ownership: company status updates verify that the internship belongs to the authenticated company.
- Secrets: API keys and JWT secrets are environment variables and `.env` is ignored.
- Login brute-force defense: dedicated login rate limiter.

## Threat model summary

**Student threats:** attempt to apply after deadline, access another student's applications, or call company endpoints.

**Company threats:** attempt to edit another company's application, exceed active-posting limits, or manipulate frontend controls.

**Unauthenticated attacker:** brute-force credentials, call protected APIs, inject SQL payloads, or exploit permissive browser/API configuration.

**External provider failure:** Resend timeout, rate limit, or 5xx response must not cause a successful core database operation to be reported as failed.

## Before / after evidence

### Fix 1 — Login rate limiting
**Before:** `/api/auth/login` had no endpoint-specific abuse control.

**After:** `express-rate-limit` is attached directly to `/api/auth/login` with a configurable window and maximum attempts. A production deployment should tune the values based on traffic and account-abuse monitoring.

### Fix 2 — CORS and security headers
**Before:** `cors()` allowed all origins by default.

**After:** the API accepts the configured `FRONTEND_ORIGIN` only, uses Helmet security headers, disables `X-Powered-By`, and limits JSON/body size.

## Test evidence

The suite includes backend unit tests, backend Supertest integration tests, and React Testing Library component tests. The target is 15+ automated tests with one command: `npm test`.

## Dependency evidence

Run:

```bash
npm audit --audit-level=high
```

A clean submission should include the generated `package-lock.json` and a captured audit result. If npm reports a high/critical issue that cannot safely be upgraded, document the package, advisory, exploitability in TalentBridge, and compensating control here rather than hiding the result.

## Residual risks

This is an internship project, not a production penetration test. Production deployment should add HTTPS, centralized security logging/alerting, secret rotation, account lockout/step-up authentication for suspicious activity, CSRF protection if cookie authentication is introduced, and a managed PostgreSQL backup/restore strategy.
