# Horizon - Academic Performance Tracker

Horizon is a powerful, modern, and secure web application designed to help students track their Cumulative Grade Point Average (CGPA) and predict future academic performance. Built with React, TypeScript, and Supabase, it offers a seamless experience with support for multiple grading systems.

## Features

- **Dynamic GPA Calculation**: Real-time calculation of GPA and CGPA as you add semesters and courses.
- **Multiple Grading Scales**: Support for various university grading systems:
  - **Default 5.0 Scale**: Standard A-F (5.0 - 0.0).
  - **Default 5.0 with E**: Includes 'E' grade (1.0 point).
  - **NUC Reform 4.0**: Nigerian Universities Commission standard (4.0 scale).
  - **Strict Private 5.0**: Higher thresholds for grades (e.g., A starts at 75).
- **What-If Calculator**: Simulate future semesters to see what grades you need to achieve your target CGPA.
- **Goal Tracking**: Set a target CGPA and track your progress visually.
- **Secure Authentication**: Robust sign-up and login system powered by Supabase with email verification and password strength enforcement.
- **Responsive Design**: Beautiful, mobile-first interface with Dark Mode support.
- **Security**: Implemented with Content Security Policy (CSP), input validation, and Row Level Security (RLS).

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Backend / Database**: Supabase (PostgreSQL, Auth)
- **Deployment**: Vercel (Ready)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EtomCoda/C-GPA-Tracker.git
   cd C-GPA-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Security

- **Client-Side Validation**: Strict checks for email formats and password complexity.
- **Input Sanitization**: Length limits on inputs to prevent DoS and buffer overflow attempts.
- **Content Security Policy**: Restricts resource loading to trusted sources.
- **Database Security**: User data is isolated using Supabase Row Level Security (RLS) policies.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


