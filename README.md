# CookWise

**The AI-Powered Kitchen Operating System**

> **Note**: This project is currently in active development.

CookWise is a centralized web application designed to digitize and automate the culinary workflow. It streamlines recipe management, pantry tracking, meal planning, and shopping list generation using AI-powered features.

## 🚀 Features

-   **AI Recipe Parsing**: Extract ingredients and instructions from images or URLs using Google Gemini.
-   **Smart Pantry**: Track inventory with status indicators (Low/Out) and expiration tracking.
-   **Meal Planning**: Drag-and-drop weekly meal scheduling.
-   **Intelligent Shopping List**: Automatically generate lists based on meal plans and pantry stock.
-   **Multi-User**: Real-time sync for household members.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 13+](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Runtime**: [Bun](https://bun.sh/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **UI**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
-   **AI**: [Google Gemini API](https://ai.google.dev/)
-   **Auth**: [NextAuth.js](https://next-auth.js.org/)

## 🏁 Getting Started

### Prerequisites

-   Use [Bun](https://bun.sh/) as the package manager.
-   PostgreSQL database (local or cloud).
-   Google Gemini API Key.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/RohiRIK/cookwise.git
    cd cookwise
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Configure Environment:**

    Copy `.env.example` to `.env.local` and update the values:

    ```bash
    cp .env.example .env.local
    ```

    Ensure you set `DATABASE_URL`, `GEMINI_API_KEY`, and `NEXTAUTH_SECRET`.

4.  **Database Setup:**

    ```bash
    # Start your local Postgres server
    # Run migrations
    bunx prisma migrate dev
    ```

5.  **Run Development Server:**

    ```bash
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📂 Documentation

Detailed documentation is available in the `docs/` directory:

-   [Product Requirements (PRD)](docs/00-PRD.md)
-   [Database Schema](docs/01-database-schema.md)
-   [Technical Specification](docs/02-technical-spec.md)
-   [Development Setup](docs/06-development-setup.md)

## 📄 License

This project is licensed under the MIT License.
