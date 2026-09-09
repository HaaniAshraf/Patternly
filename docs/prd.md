# Patternly — AI Personal Pattern & Experiment SaaS

## 1. PROJECT OVERVIEW

Build a production-ready B2C web SaaS called **Patternly**.

### Core concept

Patternly helps users discover patterns in their daily behavior and test those patterns through personal experiments.

The core loop is:

**Track → Discover → Test → Learn**

Example:

A user tracks sleep, exercise, mood, energy, and productivity.

After enough data:

> "Your productivity is 24% higher on days when you exercise."

Patternly then allows the user to turn that observation into an experiment:

> "Let's test whether exercising before work actually improves your productivity."

After the experiment:

> "Your productivity increased from 6.2/10 to 7.5/10 during the experiment. Result: Probably supported."

The application must clearly distinguish **correlation/association from causation**.

---

# 2. IMPORTANT MVP SCOPE

Build a **web application only**.

Do NOT build:

* Mobile application
* Native iOS/Android
* Wearable integrations
* Apple Health
* Google Fit
* Fitbit
* Garmin
* Banking integrations
* Social network
* Community
* AI chatbot
* Browser extension
* Advanced ML
* Multi-user/team accounts

These are future features.

The MVP should be simple, polished, responsive and functional.

---

# 3. TECHNOLOGY STACK

Use the following stack unless there is a strong technical reason not to.

## Frontend

* React
* Vite
* TypeScript
* React Router
* Tailwind CSS
* shadcn/ui
* Recharts
* React Hook Form
* Zod

## Backend

* Node.js
* Express
* TypeScript

## Database

* MongoDB
* Mongoose

## Authentication

Use JWT authentication with secure HTTP-only cookies.

Support:

* Email/password registration
* Email/password login
* Logout
* Current-user session

Structure authentication so Google OAuth can be added later.

## AI

Use an LLM API through the backend only.

Never expose AI API keys to the frontend.

Use structured JSON responses from the LLM.

## Payments

Create a payment abstraction layer.

The initial implementation should support **Razorpay subscriptions**.

Structure billing code so Stripe can be added later.

## Email

Create an email service abstraction.

It should support transactional emails later.

Do not make email delivery a hard dependency for the initial local development environment.

---

# 4. APPLICATION STRUCTURE

Create two applications:

```text
patternly/
├── client/
└── server/
```

Recommended:

```text
patternly/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── context/
│   │   └── main.tsx
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── server.ts
│   └── package.json
│
├── README.md
└── .env.example
```

---

# 5. DESIGN SYSTEM

The UI should feel:

* Premium
* Calm
* Scientific
* Personal
* Modern
* Minimal

Do NOT make it look like:

* A medical application
* A generic admin dashboard
* A crypto dashboard
* A typical AI SaaS with excessive gradients

Use:

* clean typography
* generous whitespace
* subtle borders
* rounded cards
* simple charts
* restrained animations
* clear hierarchy

The primary experience should feel like:

> **A personal data laboratory.**

---

# 6. PUBLIC WEBSITE

Create the following public routes:

```text
/
 /pricing
 /login
 /register
```

---

# 7. LANDING PAGE

## Hero

Headline:

> **What actually makes you better?**

Subheadline:

> Track a few things about your day. Discover your personal patterns. Test what actually works.

Primary CTA:

> **Start for free**

Secondary CTA:

> **See how it works**

---

## How it works

Three/four steps:

### 01 — Track

> Spend less than 30 seconds recording your day.

### 02 — Discover

> Patternly finds interesting relationships in your personal data.

### 03 — Test

> Turn a pattern into a personal experiment.

### 04 — Learn

> Build an evidence-based understanding of yourself.

---

## Example insight section

Display an example card:

> 🔍 Pattern Found
>
> You are 26% more productive on days when you exercise.
>
> Based on 21 comparable days.
>
> **Confidence: Moderate**
>
> [Test this pattern]

Clearly label the data as an example.

---

## Pricing preview

Show:

### Free

₹0/month

### Pro

₹299/month

CTA:

> Start for free

---

# 8. AUTHENTICATION

## Register page

Fields:

* Name
* Email
* Password
* Confirm password

Validation:

* Valid email
* Password minimum 8 characters
* Password confirmation must match

Actions:

* Create account
* Login link

---

## Login page

Fields:

* Email
* Password

Actions:

* Login
* Forgot password placeholder
* Register link

---

# 9. USER ONBOARDING

After first registration, redirect to onboarding.

Do not show the main dashboard until onboarding is completed.

## Step 1 — Goals

Question:

> **What do you want to understand about yourself?**

Options:

* Productivity
* Sleep
* Energy
* Mood
* Fitness
* Learning
* Habits
* General wellbeing

Allow multiple selections.

---

## Step 2 — Curiosity

Question:

> **What are you curious about?**

Options:

* What affects my productivity?
* What affects my sleep?
* What affects my mood?
* When am I most productive?
* Which habits actually help me?

Allow custom text.

---

## Step 3 — Complete

Show:

> **You're ready.**

> Start with a 30-second check-in each day. We'll start looking for patterns as your data grows.

CTA:

> **Go to dashboard**

Set:

```text
onboardingCompleted = true
```

---

# 10. AUTHENTICATED APPLICATION LAYOUT

Desktop sidebar:

```text
Patternly

Overview
Check-in
Patterns
Experiments
Insights

----------------

Profile
Settings
Upgrade
```

Mobile:

Use bottom navigation:

```text
Home
Check-in
Patterns
Experiments
Profile
```

All authenticated routes must be protected.

---

# 11. DASHBOARD

Route:

```text
/dashboard
```

Dashboard should display:

## Header

> Good morning, {firstName}

Use appropriate greeting based on local time.

---

## Today's check-in

If today's entry doesn't exist:

Show:

> **Today's check-in**

> How are you doing today?

CTA:

**Complete check-in**

If completed:

> ✓ Today's check-in completed

CTA:

**View today's entry**

---

# 12. WEEKLY OVERVIEW

Show cards for:

### Sleep

Average hours

### Energy

Average 1–10

### Mood

Average 1–10

### Productivity

Average 1–10

Show week-over-week trend where sufficient data exists.

Example:

```text
Productivity
7.2 / 10
↑ 12%
```

If insufficient data:

> Keep checking in to see your trend.

---

# 13. DASHBOARD CHARTS

Use Recharts.

Include:

### Productivity over time

Line chart.

### Sleep over time

Line chart.

Charts must be responsive.

Do not overwhelm the dashboard with too many charts.

---

# 14. PATTERN PREVIEW

If patterns exist, show the highest-confidence active pattern.

Example:

> 🔍 **Pattern Found**
>
> Your productivity is 24% higher on days when you exercise.
>
> Based on 21 comparable days.
>
> Confidence: Moderate
>
> [View pattern]

If no patterns exist:

> **We're still learning**
>
> Complete more check-ins and we'll start looking for meaningful patterns.

---

# 15. DAILY CHECK-IN

Route:

```text
/check-in
```

The check-in must be extremely fast.

Target completion time:

**under 30 seconds.**

Fields:

## Sleep

Input:

Hours/minutes.

Store as decimal hours.

Example:

7h 30m → 7.5

---

## Energy

Slider:

1–10

---

## Mood

Slider:

1–10

---

## Productivity

Slider:

1–10

---

## Exercise

Toggle:

Yes / No

---

## Note

Optional textarea.

Placeholder:

> Anything unusual today?

Maximum length:

500 characters.

---

## Save

Button:

> Save today's check-in

Prevent duplicate entries for the same user/date.

After successful submission:

Show:

> **You're done for today ✓**

Then show a brief summary.

---

# 16. DAILY ENTRY HISTORY

Route:

```text
/check-ins
```

Display entries by date.

Each entry should show:

* Date
* Sleep
* Energy
* Mood
* Productivity
* Exercise
* Note preview

Allow opening an entry.

Allow editing/deleting the entry.

---

# 17. PATTERN ENGINE

This is one of the most important backend components.

Do NOT ask the LLM to calculate patterns.

The backend must calculate candidate relationships.

The AI only explains the calculated result.

---

# 18. INITIAL PATTERN VARIABLES

Inputs:

* Exercise
* Sleep
* Energy

Outcomes:

* Productivity
* Mood
* Energy

Examples:

```text
Exercise → Productivity

Exercise → Mood

Sleep → Productivity

Sleep → Energy

Sleep → Mood

Energy → Productivity
```

---

# 19. MINIMUM DATA REQUIREMENT

Do not generate meaningful patterns from tiny datasets.

Minimum:

**7 days**

Preferred:

**14+ days**

For comparisons such as exercise vs non-exercise, require a reasonable number of observations in both groups.

If insufficient:

```text
status = "insufficient_data"
```

Do not show the result as a pattern.

---

# 20. PATTERN CALCULATION

For binary variables such as exercise:

Calculate:

```text
average outcome on exercise days
average outcome on non-exercise days
absolute difference
percentage difference
sample size
```

Example:

```text
Exercise days = 12
Average productivity = 7.8

Non-exercise days = 13
Average productivity = 6.2

Difference = 1.6

Percentage difference = 25.8%
```

For continuous variables such as sleep:

Calculate an appropriate correlation/association metric.

The exact statistical implementation can initially use a standard statistical library.

---

# 21. PATTERN CONFIDENCE

Use:

```text
strong
moderate
weak
insufficient
```

Do not claim that a pattern is causal.

Pattern language must use:

> appears associated with

> may be related to

> your data suggests

Never:

> causes

unless explicitly discussing established external scientific knowledge.

---

# 22. PATTERN CARD

Each pattern should contain:

### Title

Example:

> Exercise may improve your productivity

### Summary

> Your productivity is 26% higher on exercise days.

### Data

* Exercise days: 12
* Non-exercise days: 13
* Difference: +26%
* Sample size: 25

### Confidence

Moderate

### Caveat

> Sleep was slightly higher on exercise days, which may contribute to the difference.

Actions:

**Test this**

**Dismiss**

**View details**

---

# 23. PATTERN DETAIL PAGE

Route:

```text
/patterns/:id
```

Display:

* Pattern title
* Explanation
* Underlying data
* Chart
* Sample size
* Confidence
* Caveats
* Related entries
* Related experiments

CTA:

> **Create experiment**

---

# 24. AI PATTERN EXPLANATION

Send structured data to the backend LLM service.

Example input:

```json
{
  "variableA": "exercise",
  "variableB": "productivity",
  "exerciseDays": 12,
  "exerciseAverage": 7.8,
  "nonExerciseDays": 13,
  "nonExerciseAverage": 6.2,
  "percentageDifference": 25.8,
  "sampleSize": 25,
  "potentialConfounders": [
    "sleep was higher on exercise days"
  ]
}
```

Expected output:

```json
{
  "title": "Exercise may improve your productivity",
  "summary": "...",
  "confidence": "moderate",
  "caveats": [
    "..."
  ],
  "suggestedExperiment": "..."
}
```

Validate the JSON before storing.

---

# 25. EXPERIMENTS

Route:

```text
/experiments
```

Display:

* Active experiments
* Completed experiments
* Upcoming experiments

---

# 26. CREATE EXPERIMENT

Route:

```text
/experiments/new
```

User can start from:

1. A detected pattern
2. A custom hypothesis

---

## Experiment form

### Title

Example:

> Exercise → Productivity

### Hypothesis

Example:

> Exercising before work improves my productivity.

Allow user editing.

---

### Baseline period

Options:

* 7 days
* 14 days

Default:

7 days.

---

### Experiment period

Options:

* 7 days
* 14 days
* 21 days
* 30 days

Default:

14 days.

Free users can have restricted options.

---

### Primary metric

Select:

* Productivity
* Mood
* Energy
* Sleep

---

### Secondary metrics

Optional:

* Sleep
* Mood
* Energy
* Productivity

---

# 27. EXPERIMENT STATES

Use:

```text
draft
baseline
active
completed
cancelled
```

---

# 28. EXPERIMENT FLOW

Example:

```text
Pattern
  ↓
Create experiment
  ↓
Baseline
  ↓
Experiment period
  ↓
Daily tracking
  ↓
Complete
  ↓
Calculate result
  ↓
AI interpretation
  ↓
Result
```

---

# 29. EXPERIMENT DASHBOARD

Route:

```text
/experiments/:id
```

Display:

### Title

Exercise → Productivity

### Status

Baseline / Active / Completed

### Progress

Day 8 / 14

Progress bar.

---

## Metrics

Baseline:

6.3 / 10

Experiment:

7.5 / 10

Change:

+19%

---

## Today's experiment check-in

Integrate experiment-related fields into the normal daily check-in.

Do NOT force the user to submit two separate daily forms.

---

# 30. EXPERIMENT RESULT

When experiment completes, calculate:

* baseline average
* experiment average
* absolute change
* percentage change
* sample size
* confidence

Then send the structured result to the AI.

---

# 31. RESULT SCREEN

Example:

# Experiment Complete

### Exercise → Productivity

## Probably supported

Baseline:

6.3 / 10

Experiment:

7.5 / 10

### Change

**+19%**

### What we learned

> Your productivity was higher during the experiment period.

### Confidence

Moderate

### Caveat

> You also slept longer during the experiment, so the improvement cannot necessarily be attributed entirely to exercise.

### Suggested next experiment

> Test whether exercising before 9 AM produces a similar effect.

CTA:

**Start next experiment**

---

# 32. INSIGHTS

Route:

```text
/insights
```

This page represents accumulated knowledge about the user.

Sections:

### Productivity

Examples:

🟢 Exercise → strong positive association

🟢 7+ hours sleep → positive association

🟡 Morning work → possible association

### Mood

Examples:

🟢 Exercise → positive association

### Sleep

Examples:

🟡 Screen time → insufficient evidence

Each insight should be clickable.

---

# 33. WEEKLY REPORT

Generate a weekly summary.

Display:

### Your week

Productivity:

↑ 12%

Mood:

↑ 8%

Sleep:

↓ 4%

---

### What changed?

Natural language explanation based only on actual user data.

### Interesting pattern

Show strongest recent pattern.

### Suggested experiment

Show one experiment suggestion.

---

# 34. PROFILE

Route:

```text
/profile
```

Display:

* Name
* Email
* Goals
* Interests
* Account creation date
* Current plan

Allow editing name and goals.

---

# 35. SETTINGS

Route:

```text
/settings
```

Sections:

### Account

* Name
* Email

### Notifications

* Daily reminder toggle
* Weekly report toggle

### Privacy

* Export data
* Delete account

### Billing

* Current plan
* Manage subscription

---

# 36. BILLING

Route:

```text
/pricing
```

## Free

₹0/month

Limits:

* 14 days history
* 3 detected patterns
* 1 active experiment
* Basic weekly summary

---

## Pro

₹299/month

Includes:

* Unlimited history
* Unlimited patterns
* Unlimited experiments
* Advanced pattern analysis
* AI explanations
* Weekly reports
* Personal insights
* Data export

---

## Annual

₹2,499/year

Show savings.

---

# 37. FEATURE LIMITS

Free plan limits must be enforced on the backend.

Do NOT rely on frontend checks.

Example:

```text
Free:
maxPatterns = 3
maxActiveExperiments = 1
historyDays = 14

Pro:
unlimited
```

Create a centralized subscription/feature-limit service.

---

# 38. PAYMENT FLOW

Example:

```text
User clicks Upgrade
        ↓
Create Razorpay subscription
        ↓
Checkout
        ↓
Payment
        ↓
Webhook
        ↓
Update user subscription
        ↓
Unlock Pro
```

Webhook must be idempotent.

Never unlock Pro solely based on frontend payment success.

---

# 39. DATABASE MODELS

## User

```js
{
  name: String,
  email: String,
  passwordHash: String,

  plan: {
    type: String,
    enum: ["free", "pro"],
    default: "free"
  },

  subscription: {
    provider: String,
    subscriptionId: String,
    status: String,
    currentPeriodEnd: Date
  },

  goals: [String],
  curiosities: [String],

  onboardingCompleted: Boolean,

  notificationPreferences: {
    dailyReminder: Boolean,
    weeklyReport: Boolean
  },

  createdAt: Date,
  updatedAt: Date
}
```

---

# 40. DAILY ENTRY MODEL

```js
{
  userId: ObjectId,

  date: Date,

  sleepHours: Number,

  energy: Number,

  mood: Number,

  productivity: Number,

  exercise: Boolean,

  note: String,

  createdAt: Date,
  updatedAt: Date
}
```

Create a compound unique index:

```text
userId + date
```

---

# 41. PATTERN MODEL

```js
{
  userId: ObjectId,

  variableA: String,
  variableB: String,

  statistics: {
    groupAValue: Number,
    groupBValue: Number,
    difference: Number,
    percentageDifference: Number,
    sampleSize: Number
  },

  confidence: {
    type: String,
    enum: [
      "strong",
      "moderate",
      "weak",
      "insufficient"
    ]
  },

  title: String,
  summary: String,

  caveats: [String],

  status: {
    type: String,
    enum: ["active", "dismissed"]
  },

  createdAt: Date,
  updatedAt: Date
}
```

---

# 42. EXPERIMENT MODEL

```js
{
  userId: ObjectId,

  patternId: ObjectId,

  title: String,

  hypothesis: String,

  baseline: {
    startDate: Date,
    endDate: Date
  },

  experimentPeriod: {
    startDate: Date,
    endDate: Date
  },

  primaryMetric: String,

  secondaryMetrics: [String],

  status: {
    type: String,
    enum: [
      "draft",
      "baseline",
      "active",
      "completed",
      "cancelled"
    ]
  },

  result: {
    baselineValue: Number,
    experimentValue: Number,
    absoluteChange: Number,
    percentageChange: Number,
    confidence: String,
    conclusion: String,
    caveats: [String],
    nextExperiment: String
  },

  createdAt: Date,
  completedAt: Date
}
```

---

# 43. INSIGHT MODEL

```js
{
  userId: ObjectId,

  category: String,

  title: String,

  description: String,

  evidence: {
    sampleSize: Number,
    relatedPatternIds: [ObjectId],
    relatedExperimentIds: [ObjectId]
  },

  confidence: String,

  status: String,

  createdAt: Date
}
```

---

# 44. API ROUTES

## Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

---

## Users

```text
GET  /api/users/me
PUT  /api/users/me
```

---

## Onboarding

```text
POST /api/onboarding
```

---

## Daily entries

```text
GET    /api/entries
GET    /api/entries/today
GET    /api/entries/:id
POST   /api/entries
PUT    /api/entries/:id
DELETE /api/entries/:id
```

---

## Patterns

```text
GET  /api/patterns
GET  /api/patterns/:id
POST /api/patterns/analyze
POST /api/patterns/:id/dismiss
```

---

## Experiments

```text
GET  /api/experiments
GET  /api/experiments/:id
POST /api/experiments
PUT  /api/experiments/:id
POST /api/experiments/:id/start
POST /api/experiments/:id/cancel
POST /api/experiments/:id/complete
```

---

## Insights

```text
GET /api/insights
GET /api/insights/:id
```

---

## Reports

```text
GET /api/reports/weekly
```

---

## Billing

```text
GET  /api/billing/status
POST /api/billing/create-subscription
POST /api/billing/cancel
POST /api/billing/webhook
```

---

# 45. API SECURITY

Every authenticated API route must verify the authenticated user.

Users must never be able to access another user's:

* entries
* patterns
* experiments
* insights
* billing data

All queries must scope by:

```text
userId = authenticatedUser.id
```

Validate all request bodies using Zod or equivalent.

Add:

* Helmet
* CORS configuration
* Rate limiting
* Request size limits
* Secure cookies
* Input sanitization

Never expose:

* password hashes
* payment secrets
* AI API keys

---

# 46. ERROR HANDLING

Backend must have centralized error handling.

Return consistent format:

```json
{
  "success": false,
  "message": "Human readable message",
  "code": "ERROR_CODE"
}
```

Frontend must show useful error states.

Do not expose stack traces to users.

---

# 47. LOADING STATES

Every async operation needs a loading state.

Examples:

* Login
* Save check-in
* Pattern analysis
* Create experiment
* Complete experiment
* Payment
* Dashboard loading

Avoid blank screens.

Use skeleton loaders where appropriate.

---

# 48. EMPTY STATES

Every list must have a useful empty state.

Example:

### Patterns

> **No patterns yet**
>
> Complete a few more daily check-ins and we'll start looking for relationships in your data.

CTA:

**Complete today's check-in**

---

# 49. RESPONSIVE DESIGN

Must work well at:

* 1440px desktop
* 1280px desktop
* 1024px tablet
* 768px tablet
* 390px mobile
* 375px mobile

No horizontal scrolling.

Charts must resize correctly.

---

# 50. ACCESSIBILITY

Implement:

* semantic HTML
* keyboard navigation
* visible focus states
* accessible form labels
* proper button states
* sufficient text contrast
* ARIA only where needed

Sliders must be keyboard accessible.

---

# 51. DATE/TIME

Store dates in UTC.

Display dates in the user's local timezone.

Daily entries must use the user's local calendar date to determine whether today's check-in exists.

Do not accidentally create duplicate entries around midnight/timezone boundaries.

---

# 52. DATA PRIVACY

Provide:

### Export

User can export their data as JSON/CSV.

### Delete

User can permanently delete their account and associated data.

Deletion should remove:

* Daily entries
* Patterns
* Experiments
* Insights

Use cascading deletion or an equivalent cleanup service.

---

# 53. AI SERVICE ARCHITECTURE

Create:

```text
server/src/services/ai/
```

with services such as:

```text
patternExplanation.service.ts
experimentAnalysis.service.ts
weeklyReport.service.ts
```

Do not call the LLM directly from controllers.

Controllers → service → AI provider.

This makes changing AI providers easier later.

---

# 54. AI FAILURE HANDLING

AI calls can fail.

The application must continue working.

If AI fails:

* Save calculated statistics
* Show generic fallback explanation
* Mark AI processing as failed/retryable

Do not make the user's experiment disappear because the AI API failed.

---

# 55. AI COST CONTROL

Do not call the LLM for every page load.

Only call it when necessary:

### Pattern

Call when a new meaningful candidate pattern is created.

### Experiment

Call after completion.

### Weekly report

Generate once per week.

Cache generated results.

---

# 56. STATISTICS VS AI

Very important:

### Backend/statistical code handles:

* averages
* differences
* percentages
* trends
* correlations
* sample sizes
* confidence calculations

### AI handles:

* explanation
* natural language
* caveats
* hypothesis wording
* experiment suggestions
* weekly summaries

The AI must never invent numeric values.

All numbers in AI output should originate from supplied backend data.

---

# 57. SAMPLE USER FLOW

A complete happy path must work:

```text
Landing
 ↓
Register
 ↓
Onboarding
 ↓
Dashboard
 ↓
Check-in
 ↓
Repeat check-in for several days
 ↓
Pattern detected
 ↓
View pattern
 ↓
Create experiment
 ↓
Baseline
 ↓
Experiment
 ↓
Complete
 ↓
Result
 ↓
Insight
 ↓
Upgrade
```

---

# 58. DEMO/SEED DATA

Create a development-only seed script.

It should generate approximately 30 days of realistic sample data for one test user.

The sample data should create at least:

1. Exercise/productivity pattern
2. Sleep/energy pattern
3. One weak/noise pattern

This allows developers to see the application without manually entering 30 days.

Do not use seed data in production.

---

# 59. DEVELOPMENT ENVIRONMENT

Create:

```text
.env.example
```

Include placeholders:

```text
MONGODB_URI=
JWT_SECRET=

AI_API_KEY=
AI_MODEL=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

CLIENT_URL=
SERVER_URL=
```

Never commit real secrets.

---

# 60. README

Create a complete README containing:

## Setup

```text
npm install
```

for both client and server.

## Environment variables

Explain every variable.

## MongoDB setup

Explain local MongoDB and MongoDB Atlas options.

## Development

Example:

```text
npm run dev
```

## Production build

Explain frontend/backend build process.

## Database seed

Explain how to run seed data.

---

# 61. CODE QUALITY

Use:

* TypeScript
* ESLint
* Prettier
* reusable components
* reusable services
* clear naming
* environment-based configuration

Avoid:

* giant components
* duplicated API calls
* business logic inside React components
* business logic inside route definitions
* hardcoded user IDs
* hardcoded subscription state

---

# 62. TESTING

At minimum create tests for:

### Backend

* Registration
* Login
* Authentication middleware
* Daily entry creation
* Duplicate daily entry prevention
* Pattern calculation
* Experiment calculation
* User data isolation

### Frontend

* Login
* Check-in submission
* Dashboard rendering
* Experiment creation

---

# 63. MVP DEFINITION OF DONE

The MVP is complete only when a new user can:

1. Register
2. Log in
3. Complete onboarding
4. Complete daily check-in
5. View historical data
6. See dashboard charts
7. Have patterns calculated from their data
8. View a pattern
9. Create an experiment from the pattern
10. Complete the experiment
11. Receive calculated results
12. Receive AI interpretation
13. View accumulated insights
14. See pricing
15. Start a Pro subscription
16. Have Pro limits correctly enforced
17. Log out
18. Delete/export their data

---

# 64. IMPORTANT PRODUCT CONSTRAINTS

Do not over-engineer.

Do not implement:

* microservices
* Kubernetes
* Redis unless genuinely necessary
* separate vector database
* AI agents
* complex ML
* event-driven architecture
* WebSockets

A standard:

**React → Express → MongoDB → AI API**

architecture is sufficient.

---

# 65. IMPLEMENTATION ORDER

Build in this order:

## Phase 1

Project setup

* Client
* Server
* MongoDB
* Environment
* Routing
* UI system

## Phase 2

Authentication

* Register
* Login
* Logout
* Protected routes

## Phase 3

Onboarding

* Goals
* Curiosities
* Completion

## Phase 4

Daily tracking

* Check-in
* Entry CRUD
* History

## Phase 5

Dashboard

* Metrics
* Charts
* Empty states

## Phase 6

Pattern engine

* Statistical calculations
* Pattern storage
* Pattern UI
* AI explanations

## Phase 7

Experiments

* Creation
* Baseline
* Active experiment
* Completion
* Results
* AI interpretation

## Phase 8

Insights/reports

* Insights
* Weekly report

## Phase 9

Billing

* Pricing
* Razorpay
* Webhooks
* Feature gating

## Phase 10

Polish

* Responsive UI
* Error handling
* Loading states
* Accessibility
* Security
* Tests
* README

---

# 66. DO NOT STOP AT UI MOCKUPS

The coding agent must implement:

* Real frontend
* Real backend
* Real MongoDB persistence
* Real authentication
* Real API calls
* Real pattern calculations
* Real AI integration through backend
* Real experiment calculations
* Real subscription integration structure

Do not replace functionality with mock data except for the explicit development seed.

---

# 67. FINAL UX GOAL

The user should open Patternly and immediately understand:

> **"This website helps me discover what affects my life, then lets me test it."**

The most important experience is:

```text
I logged something
      ↓
Patternly found something interesting
      ↓
I tested it
      ↓
I learned something about myself
      ↓
Patternly suggested what to test next
```

Everything in the MVP should support this loop.

# END OF PRD
