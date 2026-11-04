# Ledger — Personal Monthly Money Tracker

**Ledger** is a focused, minimalist personal monthly money tracker built with React, TypeScript, Tailwind CSS, and Supabase. 

It replaces messy Excel spreadsheets with exact manual discipline: you set your monthly salary, record spending and savings by hand, and immediately see your remaining spendable balance along with an objective three-state financial signal.

---

## Key Features

- **Monochrome Minimalist Aesthetic**: High-contrast, distraction-free design with a toggle between **Monolith Dark** (default) and **Monolith Light**.
- **Three-State Financial Signal**: Single source of truth defined in `src/lib/signal.ts`:
  - **COMFORTABLE** ($\ge 50\%$ remaining): *"You can spend well."*
  - **CAREFUL** ($20\%$ to $< 50\%$ remaining): *"Use it carefully."*
  - **LOW** ($< 20\%$ remaining, zero, or negative): *"You have little money, reduce your spending."*
- **Precision Integer Paise Arithmetic**: All calculations in `src/lib/money.ts` are performed in integer paise (1 Rupee = 100 paise) to prevent floating-point rounding errors, formatted using standard Indian digit grouping (`₹1,50,000.00`).
- **Real-Time Impact Simulation**: As you enter transactions, Ledger simulates your new balance, signal, and headroom live before saving.
- **Non-blocking Overdraft**: If an expense pushes your balance below zero, Ledger clearly warns you but never prevents you from recording your reality.
- **Strict Data Privacy**: Backed by PostgreSQL Row Level Security (RLS)—users can only ever access their own data.

---

## Plain-English Setup Guide

### 1. Prerequisites
Make sure you have **Node.js** installed on your computer.

### 2. Configure Supabase Backend
1. Create a free account at [Supabase](https://supabase.com) and create a new project.
2. In your Supabase dashboard, click **SQL Editor** (`>_` icon on the left menu).
3. Click **+ New query**, copy all the contents of `supabase/migrations/20261104000000_init_ledger.sql`, paste it into the query box, and click **Run**.
4. *(Recommended for quick testing)* Go to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**, toggle **"Confirm email"** to **OFF**, and click **Save**.

### 3. Set Up Your Environment Keys
In the project root folder, open the `.env` file (or copy `.env.example` to `.env`) and add your project keys from **Supabase Dashboard $\rightarrow$ Project Settings $\rightarrow$ API**:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run the Application
In your terminal, navigate to the project directory and run:

```powershell
# Windows PowerShell
npm.cmd run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running Automated Tests

To run the complete test suite (verifying signal thresholds, integer money math, month date boundaries, salary isolation, and cross-user data security):

```powershell
npm.cmd test
```

To create a production build:

```powershell
npm.cmd run build
```

---

## Project Structure

```text
Ledger/
├── src/
│   ├── components/
│   │   ├── auth/            # Sign in, Sign up, Forgot/Reset password forms
│   │   ├── layout/          # Sidebar, MainHeader, mobile navigation
│   │   └── ledger/          # Live balance card, summary cards, entries table, drawers, modals
│   ├── context/
│   │   ├── AuthContext.tsx  # Authentication and Supabase session management
│   │   └── ThemeContext.tsx # Monolith Dark / Light theme switcher
│   ├── lib/
│   │   ├── signal.ts        # Single source of truth for the three-state signal
│   │   ├── money.ts         # Integer paise precision math & Indian Rupee formatting
│   │   ├── dates.ts         # IST calendar months and date utilities
│   │   ├── ledgerApi.ts     # Supabase database query and mutation layer
│   │   └── supabase.ts      # Supabase client initialization
│   ├── pages/
│   │   ├── auth/            # Auth pages
│   │   └── Dashboard.tsx    # Main monthly ledger dashboard
│   ├── types/
│   │   └── database.ts      # TypeScript interfaces matching Supabase tables
│   ├── App.tsx              # Router and application root
│   ├── index.css            # Tailwind directives and monochrome theme styles
│   └── main.tsx             # Entry point
├── supabase/
│   └── migrations/          # SQL migrations with RLS policies and triggers
├── tests/
│   ├── signal.test.ts       # Signal threshold unit tests
│   ├── money.test.ts        # Paise arithmetic & formatting unit tests
│   ├── ledger-rules.test.ts # Date boundary, salary isolation & negative balance tests
│   └── security-rls.test.ts # Cross-user data isolation test
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.ts
```
