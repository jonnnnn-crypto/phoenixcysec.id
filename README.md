# Phoenix Cyber Security (webphoenix)

**Phoenix Cyber Security** is a modern, community-driven platform dedicated to ethical hackers, bug bounty hunters, and cybersecurity enthusiasts. The platform serves as a central hub to track, honor, and showcase the elite contributors who actively report vulnerabilities and help secure the digital ecosystem through responsible disclosure.

## 🎯 Purpose and Goals

The primary objective of this project is to foster a safe, rewarded, and competitive environment for White Hat hackers. It aims to:
- **Recognize Talent:** Highlight top contributors through a gamified Leaderboard.
- **Showcase Profiles:** Provide "Hunter Profiles" where security researchers can manage their reputation, display verified skills, and link their social presence (GitHub, Twitter, LinkedIn, etc.).
- **Manage Disclosures:** Establish a secure and streamlined process to submit, review, and approve vulnerability reports.
- **Community Building:** Create a network of professionals dedicated to offensive and defensive security under the Phoenix Cyber Security banner.

## ✨ Key Features

- **🏆 Real-Time Leaderboard:** A live, real-time synced leaderboard ranking hunters based on their "Reputation Points" accumulated from approved vulnerability reports.
- **🥇 Podium System:** Special highlighted recognition for the Top 3 hunters on the leaderboard.
- **👤 Hunter Profiles:** Detailed user profiles featuring an integrated Avatar system (falling back to DiceBear), verified skills list, earned badges (e.g., First Report, Veteran Hunter), and a timeline of recent approved reports.
- **🏅 Gamified Ranking:** Dynamic rank configurations ranging from *Ember Hunter* to *Ascended Phoenix*, complete with custom rank badges based on accumulated points.
- **🛡️ Vulnerability Reporting:** Integrated submission flows (linked to a database) to track report severity (Low, Medium, High, Critical) and reward corresponding points.
- **🔐 Secure Architecture:** Built with security in mind using robust authentication and row-level security (RLS) policies.

## 🛠️ Technology Stack

This project is built using modern and performant web technologies:

- **Frontend Framework:** [Next.js](https://nextjs.org/) (React) leveraging App Router and Server Components.
- **Language:** TypeScript for type safety and scalability.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first, highly customizable, and responsive design system emphasizing a premium "dark mode glassmorphism" aesthetic.
- **Icons:** [Lucide React](https://lucide.dev/) for crisp, consistent iconography.
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL) for real-time database subscriptions, authentication, and secure data storage.
- **Avatars:** Integrated with [DiceBear](https://dicebear.com/) for dynamic placeholder SVGs.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed to run this project:
- Node.js (Version 18.x or newer)
- npm, yarn, or pnpm
- A Supabase account and project set up.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jonnnnn-crypto/phoenixcysec.id.git
   cd phoenixcysec.id
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase connection strings:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🗄️ Database Structure

The core functionality relies on a carefully structured PostgreSQL schema via Supabase:
- `users`: Core authentication table.
- `profiles`: Stores extended user data such as bios, skills, and social links (`github_url`, `twitter_url`, etc.).
- `whitehat_reports`: Records vulnerability submissions, severity, and status.
- `bughunter_leaderboard`: An aggregated view determining ranks and total points dynamically.

---
*Built to secure the digital perimeter.*
