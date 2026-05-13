# Personal Expense Tracker

## Goal

Build a personal expense tracker primarily as a vehicle for learning to work with AI agents. The functional goal is to manage personal finances (income and expenses), with AI-assisted transaction entry via email.

## Problem

Plenty of expense trackers exist, but building my own gives me hands-on experience with AI agents in a realistic application I'd actually use.

## Solution

A web application where users log financial transactions manually or via email. Inbound emails are received by SendGrid and forwarded to a webhook. An AI agent extracts structured transaction data and either commits it directly to the ledger or stages it for review.

Example: a user emails *"Spent 100 RON at Mega Image for food and drink."* The AI extracts:

- Description: "Mega Image — food and drink"
- Amount: 100
- Operation type: outflow
- Category: Food
- Account: (default or inferred)

## Features

- Each user has their own account and ledger.
- Authentication is required to access the app.
- No cross-user data sharing.
- Manage the sender whitelist for AI email ingestion.
- Admins do **not** see other users' transaction data.
- Single currency for v1 (RON).

### Categories

- Fixed top-level categories: **Food, Housing, Utilities, Transport, Entertainment, Salary, Other**.
- Subcategories are user-defined per user (e.g., Transport → Fuel, Public transit).

### Transactions

- Fields: description, amount, operation type (inflow/outflow), category, subcategory (optional), account, date.
- Created manually via a "log entry" form, or automatically from email.
- Editable and (soft) deletable by the owning user.

### Email-based AI ingestion

- Inbound email is received via SendGrid Inbound Parse and forwarded to the application webhook.
- A **sender whitelist** controls who can submit transactions via email. Emails from non-whitelisted senders are rejected.
- The AI agent extracts: description, amount, operation type, category (and optionally subcategory and account).
- **Confident extractions** (all required fields reliably identified) are committed directly to the ledger.
- **Low-confidence extractions** (any required field uncertain or missing) are staged as **pending** in a review queue, where the user confirms or edits before the transaction lands in the ledger.

### Dashboard

- Transaction list with filtering and sorting.
- Monthly totals: income, expense, net.
- Category breakdown chart for a selected period.
- Trend chart over time (spending or net cash flow by week/month).
- Per-category budgets with progress indicators.



