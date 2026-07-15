# PrimeTrade Portal

PrimeTrade is a member portal for traders. It provides a dashboard for portfolio tracking, a trading academy, and a leaderboard. This is a standalone React + Express full-stack project using PostgreSQL for the database and Clerk for authentication.

## Tech Stack
- **Frontend**: React, Vite, Clerk (Auth), TanStack Query, Recharts, wouter, Tailwind CSS, shadcn/ui.
- **Backend**: Express, Drizzle ORM, PostgreSQL, Zod, Clerk (Auth).
- **Monorepo**: pnpm workspaces

## Prerequisites
- Node 20+
- pnpm 9+
- PostgreSQL database

## Setup

1. **Clone the repository.**

2. **Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in the missing variables:
   - `DATABASE_URL`: PostgreSQL connection string.
   - `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`: Get from Clerk Dashboard.
   - `VITE_CLERK_PUBLISHABLE_KEY`: Same as `CLERK_PUBLISHABLE_KEY`.
   - `VITE_CLERK_PROXY_URL`: Keep empty for dev.

3. **Install Dependencies**:
   ```bash
   pnpm install
   ```

4. **Seed the Database**:
   Make sure your database is running and the connection string is correct, then run:
   ```bash
   pnpm run seed
   ```
   This will initialize the necessary tables and populate some initial dummy data.

5. **Run the Development Server**:
   ```bash
   pnpm run dev
   ```
   This starts both the Vite frontend (port `5173`) and the Express backend API (port `3001`). Open `http://localhost:5173` in your browser.