# 🌍 Global Educator Nexus

AI-powered platform connecting international teachers with schools worldwide.

## 🚀 Features

### 🤖 Three AI Agents

1. **AI Screener** - Analyzes teaching video resumes using GPT-4o
   - Evaluates accent, energy, professionalism, and technical quality
   - Provides actionable feedback for improvement
   - Calculates profile completeness scores

2. **Autonomous Headhunter** - Smart job matching with RAG
   - Semantic search using OpenAI embeddings + pgvector
   - Multi-stage filtering (visa, experience, subject, salary)
   - Personalized email outreach with Claude 3.5 Sonnet

3. **Rule-based Visa Guard** - Prevents ineligible applications
   - Comprehensive visa rules for 10+ countries
   - Real-time eligibility validation
   - Cached results for instant lookups

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Neon PostgreSQL + pgvector
- **ORM:** Prisma
- **AI:** OpenAI GPT-4o, Claude 3.5 Sonnet, Embeddings
- **Storage:** Cloudflare R2 + UploadThing
- **Email:** Resend
- **Auth:** Auth.js v5
- **UI:** shadcn/ui + Tailwind CSS

## 📋 Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Neon PostgreSQL account
- OpenAI API key
- Anthropic API key
- Cloudflare R2 bucket
- UploadThing account
- Resend account

## 🏁 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/global-educator-nexus.git
cd global-educator-nexus
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys and credentials.

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed initial data
npm run db:seed
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

### Core Documentation

- **[Specification](./specification/Specification.md)** - Complete technical specification
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture and data flows
- **[Setup Guide](./docs/SETUP.md)** - Detailed setup instructions
- **[Performance](./docs/PERFORMANCE.md)** - Performance optimization & metrics
- **[API Reference](./docs/API.md)** - API endpoints & server actions

### Phase 0 Documentation (Stabilization)

- **[Implementation Plan](./docs/Phase0_Implementation_Plan.md)** - 4-week stabilization roadmap
- **[Week 3 Summary](./docs/phase0/Week3_Testing_Summary.md)** - Testing & QA expansion results

## 🏗️ Project Structure

```
global-educator-nexus/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # User dashboards
│   ├── jobs/              # Job listings & details
│   ├── profile/           # Profile management
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── teacher/           # Teacher-specific components
│   ├── recruiter/         # Recruiter-specific components
│   └── shared/            # Shared components
├── lib/                   # Core libraries
│   ├── ai/                # AI agent implementations
│   ├── db/                # Database utilities
│   ├── matching/          # Matching algorithms
│   └── visa/              # Visa rules & checker
├── prisma/                # Prisma schema & migrations
├── docs/                  # Documentation
└── specification/         # Technical specifications
```

## 🔑 Environment Variables

See [`.env.example`](./.env.example) for all required environment variables.

### Required API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| OpenAI | Video analysis & embeddings | [platform.openai.com](https://platform.openai.com) |
| Anthropic | Email generation | [console.anthropic.com](https://console.anthropic.com) |
| Neon | PostgreSQL database | [neon.tech](https://neon.tech) |
| Cloudflare R2 | Video storage | [dash.cloudflare.com](https://dash.cloudflare.com) |
| UploadThing | File uploads | [uploadthing.com](https://uploadthing.com) |
| Resend | Email delivery | [resend.com](https://resend.com) |

## 🧪 Testing

### Test Coverage: 80%+ ✅

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui
```

### Test Suites

| Suite | Tests | Status |
|-------|-------|--------|
| **Unit Tests** | 90 | ✅ Passing |
| **Integration Tests** | 52 | ✅ Passing |
| **UI Tests** | 19 | ✅ Passing |
| **Total** | **161** | **✅ All Passing** |

#### Coverage by Module

- **lib/utils**: 100% (77 tests)
- **Auth Flow**: 9 integration tests
- **Job Posting**: 11 integration tests
- **Application Submission**: 13 integration tests
- **UI Components**: 19 smoke tests

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

## 📊 Performance Metrics

| Agent | Processing Time | Cost/Operation | Accuracy |
|-------|----------------|----------------|----------|
| AI Screener | 30-45s | ~$0.15 | 85% |
| Headhunter | <2s | ~$0.002/email | 27% CTR |
| Visa Guard | <50ms | $0 (cached) | 98% cache hit |

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

- **Documentation:** Check [docs/](./docs/) folder
- **Issues:** [GitHub Issues](https://github.com/yourusername/global-educator-nexus/issues)
- **Email:** dev@globaleducatornexus.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with school management systems
- [ ] Automated interview scheduling
- [ ] Salary negotiation assistant

## 🙏 Acknowledgments

- Next.js team for amazing framework
- shadcn for beautiful UI components
- OpenAI for GPT-4o
- Anthropic for Claude 3.5 Sonnet
- Neon for serverless PostgreSQL

---

**Built with ❤️ using Next.js 15 and AI**
