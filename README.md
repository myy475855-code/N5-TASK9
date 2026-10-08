# TalentBridge — Task 7: Automated Testing & OWASP Security Review

TalentBridge is a full-stack internship platform extended for Task 7 with a meaningful automated test suite and an OWASP-informed security review. The project tests risky authentication, authorization, deadline, ownership, email-resilience, search/filter, and login-validation behavior rather than chasing trivial coverage.

## What this task adds

- Backend Jest unit tests for business rules and email resilience.
- Supertest integration tests for registration, login, protected routes, role restrictions, ownership violations, and deadline enforcement.
- React Testing Library + Vitest component tests for login validation and internship search/filter behavior.
- A simulated failed API call test that verifies a visible frontend error state.
- Isolated PostgreSQL-compatible test database using `pg-mem`; test data is reset between tests.
- Login-specific brute-force protection using `express-rate-limit`.
- Explicit production CORS origin instead of `*`.
- Helmet security headers and Express fingerprinting disabled.
- Parameterized SQL review for injection resistance.
- JWT expiry and issuer validation.
- `SECURITY-AUDIT.md` mapping the application to all OWASP Top 10:2021 categories.

## Run from a clean checkout

```bash
npm install
npm test
npm audit --audit-level=high
```

Frontend development:

```bash
npm --prefix frontend run dev
```

Backend development:

```bash
npm run migrate
npm run seed
npm start
```

## Environment

Copy `.env.example` to `.env` and configure PostgreSQL, JWT secret, frontend origin, and email credentials. Never commit `.env` or API keys.

## Test pyramid

**Unit > integration > E2E**. The project concentrates the largest number of fast unit/component tests on risky logic, then uses Supertest for API behavior. Full browser E2E is intentionally not required by this task.

## Arrange-Act-Assert

Tests follow the pattern: prepare isolated data and mocks, perform the user/API action, then assert on the observable result and security status.

## Required evidence

Before submission, capture:

1. `npm test` showing all tests passing.
2. `npm audit --audit-level=high` output.
3. Before/after screenshots or terminal output for login rate limiting.
4. Before/after CORS behavior or security-header evidence.
5. `SECURITY-AUDIT.md` committed alongside source.

## Important

The included source is a complete implementation scaffold, but provider credentials, production database credentials, and final dependency-audit results are environment-specific and must be supplied/run by the student.
