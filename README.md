# CMO Command

A personalized, persistent analytics and insights workspace for CMOs and senior marketers. The platform generates a smart UI that evolves based on the leader's brand, industry, and goals — powered by public marketing data, embedded AI, and a dynamic question-based interface.

## 🚀 Features

- Personalized executive dashboard on first login
- Cross-platform brand performance tracking
- Strategic question-based insights
- Iterative dashboard refinement and persistence
- Real-time data aggregation from multiple sources

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Magic Links
- **Database**: PostgreSQL with Prisma ORM
- **API Integration**: RESTful services with public marketing APIs
- **AI/ML**: HuggingFace models for sentiment analysis
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 🏗️ Project Structure

```
cmo-command/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and shared logic
│   ├── types/              # TypeScript type definitions
│   └── services/           # API and external service integrations
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
└── tests/                  # Test files
```

## 🚦 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# API Keys
LINKEDIN_API_KEY=""
TWITTER_API_KEY=""
INSTAGRAM_API_KEY=""
SIMILARWEB_API_KEY=""
```

## 📝 License

MIT License - see LICENSE file for details 