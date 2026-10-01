# WorkNoon AI Refund Support System

A full-stack AI-assisted refund support system built for the WorkNoon Full Stack AI Integration Product Challenge.

The system accepts customer refund requests, validates them against deterministic business rules, uses AI for customer-facing reasoning and response generation, and provides an admin dashboard for reviewing refund outcomes and audit information.

## Features

* Customer refund request portal
* Synthetic customer and order data
* Automated refund policy engine
* APPROVED / DENIED / ESCALATED outcomes
* High-value refund escalation
* Final-sale protection
* Refund age validation
* Damaged/incorrect-item handling
* Suspicious or conflicting request escalation
* Prompt-injection detection
* AI-assisted customer responses
* Admin dashboard with request history and outcomes
* Audit logging
* PostgreSQL-style relational architecture implemented with Prisma and SQLite for the challenge environment
* Docker Compose support

## Refund Policy

The policy engine evaluates requests in the following order:

1. **Final-sale items** → DENIED
2. **Suspicious or conflicting requests** → ESCALATED
3. **Orders older than 30 days** → DENIED
4. **Refunds above $500** → ESCALATED for human review
5. **Damaged or incorrect items** → APPROVED
6. **Other eligible requests** → APPROVED

The policy engine is deterministic. This prevents an AI response from overriding core business rules.

## AI Integration

The backend includes an OpenAI integration for generating customer-facing refund responses.

The application is designed to continue operating when the AI provider is unavailable. If the API key is missing or the provider cannot be reached, the system uses a deterministic fallback response.

The AI is therefore used as an assistant ra
