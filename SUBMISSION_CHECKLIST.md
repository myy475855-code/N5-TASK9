# Task 6 Submission Checklist

- [x] Real external transactional email integration (Resend)
- [x] API key loaded from environment
- [x] Dedicated emailService module
- [x] Timeout
- [x] Retry/backoff
- [x] Idempotency key
- [x] Graceful degradation
- [x] Application confirmation email
- [x] Status-change notification email
- [x] Server-side application deadline enforcement
- [x] Automatic/lazy deadline closing
- [x] Configurable max active postings
- [x] Server-side company ownership check
- [x] Migration
- [x] OpenAPI
- [x] HTTP 409 business-rule errors
- [x] Responsive UI
- [x] Toast confirmations
- [x] Tests
- [x] .env.example
- [x] .env ignored in .gitignore

## Evidence still required from your machine/account

1. Configure a real Resend key in `.env`.
2. Send a test application.
3. Capture the received sandbox/test email.
4. Change an application status as the owning company.
5. Capture the status email.
6. Capture the 409 deadline response.
7. Capture the 409 posting-limit response.
8. Confirm `git check-ignore .env` reports `.env`.
