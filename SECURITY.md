# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of our Quality Management System (QMS) software seriously. If you believe you have found a security vulnerability in this application, please report it to us as described below.

### Disclosure Policy

* Please report security vulnerabilities to the maintainers privately.
* Do not create public GitHub issues for security vulnerabilities.
* Provide detailed steps to reproduce the vulnerability.

### Security Best Practices Implemented
* **No Plaintext API Keys**: API keys (such as `GROQ_API_KEY`) are managed via `.env` files and environment variables.
* **Input Sanitization**: Pydantic schemas validate all incoming JSON payloads.
* **CORS Middleware**: Restricted API origins enabled for frontend communication.
* **21 CFR Part 11 Audit Trail**: Immutable logging of QMS actions.
