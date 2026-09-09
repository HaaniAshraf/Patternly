# Patternly

AI Personal Pattern & Experiment SaaS

Patternly helps users discover patterns in their daily behavior and test those patterns through personal experiments. The core loop is **Track → Discover → Test → Learn**.

> This repository is currently at the planning stage. The full product specification lives in [docs/prd.md](docs/prd.md); the `client/` and `server/` applications described below will be scaffolded as implementation proceeds.

## Tech stack

**Frontend:** React, Vite, TypeScript, React Router, Tailwind CSS, shadcn/ui, Recharts, React Hook Form, Zod

**Backend:** Node.js, Express, TypeScript

**Database:** MongoDB, Mongoose

**Auth:** JWT with secure HTTP-only cookies (email/password, structured for Google OAuth later)

**Payments:** Razorpay subscriptions, behind an abstraction that allows adding Stripe later

**AI:** LLM calls made server-side only, never exposed to the frontend

## Project structure

```text
patternly/
├── client/           # React + Vite frontend
├── server/           # Express + TypeScript backend
├── docs/
│   └── prd.md        # Full product requirements document
├── README.md
└── .env.example
```

## Setup

Once `client/` and `server/` are scaffolded:

```bash
cd client && npm install
cd ../server && npm install
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | Connection string for MongoDB (local or Atlas) |
| `JWT_SECRET` | Secret used to sign JWT auth tokens |
| `AI_API_KEY` | API key for the LLM provider used for AI explanations |
| `AI_MODEL` | Model identifier to use for AI requests |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Secret used to verify Razorpay webhook signatures |
| `CLIENT_URL` | Base URL of the frontend (for CORS/redirects) |
| `SERVER_URL` | Base URL of the backend API |

Never commit real secrets — `.env` should stay out of version control.

### MongoDB setup

- **Local:** install MongoDB Community Edition and point `MONGODB_URI` at `mongodb://localhost:27017/patternly`.
- **Atlas:** create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas), add your IP to the access list, and use the provided connection string.

## Development

```bash
# server
cd server && npm run dev

# client
cd client && npm run dev
```

## Production build

```bash
# client
cd client && npm run build

# server
cd server && npm run build && npm start
```

## Database seed

A development-only seed script generates ~30 days of realistic sample data (check-ins, patterns, and one weak/noise pattern) for a single test user, so the app can be explored without manual data entry:

```bash
cd server && npm run seed
```

Do not run the seed script against a production database.

## Documentation

See [docs/prd.md](docs/prd.md) for the complete product requirements, data models, API routes, and implementation plan.
