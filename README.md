# ALBORISS — Production Typing Assessment System

A mobile-first, high-reliability typing assessment platform built for the **Alboriss Non-IT Hiring Drive** (200–400 candidates in batches of 15).

---

## Key Highlights

- **Candidate Interface (`/typing-test`)**:
  - Designed mobile-first, tested for viewports 320px to 430px (iPhone, Android, Tablets, Desktop).
  - Minimum 44px touch targets, zero horizontal scrolling, iOS auto-zoom prevention.
  - Automatic batch association (no manual batch manipulation by candidates).
  - 15-candidate limit enforcement (`BATCH FULL` protection).
  - Mandatory instructions confirmation.
  - **1-Minute Practice**: 60s trial with restart support, doesn't affect merit rank.
  - **1-Minute Actual Test**: Timestamp-based drift-free timer (`current_time - started_at`).
  - **Anti-Cheat & Reload Detection**:
    - Disables copy, cut, paste, context menu on typing area and passage.
    - Listens for page reloads, browser back navigation, tab-switching/minimizing (`beforeunload`, `visibilitychange`, `popstate`).
    - Immediately marks attempt as `INVALID` with exact audit reason in Supabase.
    - Prevents retakes or duplicate attempts for the same candidate in an active batch.
  - **Offline/Network Resilience**: Continues timer based on timestamp if connection briefly drops, without falsely disqualifying.

- **Admin Interface (`/admin`)**:
  - Secure authenticated portal with recruiter passcode protection.
  - Live candidate monitoring with Supabase Realtime subscriptions (In Progress, Completed, Invalid, Waiting slots).
  - Automatic ranking by **Net WPM (Highest → Lowest)**, tie-breaker: **Accuracy**, secondary: **Errors**.
  - Batch Management:
    - Automatically incrementing batches (`Batch 01`, `Batch 02`, etc.).
    - Open / Close batch controls.
    - Dynamic Passage assignment: Practice default + Actual Passages (Passage A, B, C) to prevent cross-batch memorization.
    - Configurable candidate capacity (default 15).
  - Summary metrics: Total candidates, Completed, Invalid, Average WPM, Average Accuracy, Highest & Lowest WPM.
  - Transparent Invalid Attempts audit table with timestamps and reasons.
  - **Excel Exports (SheetJS / XLSX)**:
    - **Export Current Batch**: Downloads `Alboriss_Typing_Assessment_Batch_XX.xlsx` with:
      - *Sheet 1: Results* (Rank, Name, Batch, Gross WPM, Net WPM, Accuracy, Errors, Chars, Date, Time, Status)
      - *Sheet 2: Invalid Attempts* (Name, Batch, Reason, Timestamp, Status)
      - *Sheet 3: Summary* (Batch, Total Candidates, Completed, Invalid, Avg WPM, Avg Accuracy, High/Low)
    - **Master Export**: Downloads `Alboriss_Typing_Assessment_All_Results.xlsx` consolidating all candidates across all batches.

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React
- **Database**: Supabase (PostgreSQL with Row Level Security and Realtime)
- **Excel Generation**: SheetJS (`xlsx`)
- **Deployment**: Vercel-ready with `vercel.json` SPA routing

---

## Quick Start (Local Setup)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your Supabase project credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_ADMIN_PASSWORD=alboriss2026
```

*(Note: If you run without Supabase credentials, the application automatically uses an in-browser local storage mock store with full functionality so you can test immediately offline!)*

### 3. Setup Supabase Database
1. Go to your [Supabase Dashboard](https://app.supabase.com) and open your project.
2. Open the **SQL Editor** tab.
3. Open [`supabase/schema.sql`](./supabase/schema.sql), copy the contents, and click **Run**.
4. This will create:
   - `batches` table
   - `typing_attempts` table
   - High-performance indexes
   - Row Level Security (RLS) policies
   - Real-time replication publications
   - Seed record for `Batch 01`

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at:
- Candidate assessment: `http://localhost:3000/typing-test`
- Recruiter admin portal: `http://localhost:3000/admin` (Passcode: `alboriss2026`)

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## Deploying to Vercel

1. Push this repository to GitHub / GitLab.
2. In the Vercel Dashboard, click **Add New Project** and import the repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSWORD`
4. Click **Deploy**. Vercel will automatically detect Vite and use `vercel.json` for seamless client-side routing.

---

## Passage Configuration

Passages are maintained in [`src/data/typingPassages.js`](./src/data/typingPassages.js):
- **Practice Passage**: Standardized trial passage with letters, numbers, ₹ currency, decimals, dates, emails, and punctuation.
- **Passage A**: Standard Operations passage.
- **Passage B**: Customer Verification passage.
- **Passage C**: Account Processing passage.

New passages can be added directly to the `ACTUAL_PASSAGES` array in that file.

---

## Replacing the Alboriss Logo

Place your official Alboriss logo file at:
```
src/assets/alboriss-logo.png
```
The application will automatically pick it up across both Candidate and Admin interfaces.
