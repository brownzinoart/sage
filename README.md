# 🌿 BudGuide - Digital Budtender Platform

A sophisticated digital budtender platform for hemp/CBD product discovery, built with conversational AI and Zen design principles to reduce "store fear" and create a calming, welcoming experience for users exploring hemp products.

## 🎯 Project Overview

BudGuide transforms hemp product discovery through:

- **Conversational AI**: Natural language processing for intent classification and product matching
- **Zen Design System**: Calming, anxiety-reducing interface design
- **Privacy-First**: 4-level privacy system (Anonymous to Account sync)
- **Compliance-Ready**: Built for North Carolina hemp regulations
- **Semantic Search**: Vector-based product matching with pgvector

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    Next.js 14 + TypeScript                   │
│                    Tailwind CSS + Zen Design                 │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      API Gateway                             │
│                   FastAPI + Pydantic                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Core Services                             │
├──────────────────────────────────────────────────────────────┤
│  NLP Engine         │  Recommendation    │  Compliance      │
│  spaCy + Transformers│  Vector Search     │  Monitor         │
├──────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
│  PostgreSQL + pgvector  │  Redis Cache  │  Sample Data       │
└──────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for local development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd sage
cp backend/.env.example backend/.env
```

### 2. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Initialize Database

```bash
# Wait for PostgreSQL to be ready, then load sample data
docker-compose exec backend python scripts/load_sample_data.py
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Local Development

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Run development server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install

# Run development server
npm run dev
```

### Database Setup (Local)

```bash
# Start PostgreSQL with pgvector
docker run --name budguide-postgres \
  -e POSTGRES_DB=budguide \
  -e POSTGRES_USER=budguide \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d pgvector/pgvector:pg15

# Run migrations
psql postgresql://budguide:password@localhost:5432/budguide < migrations/001_initial_schema.sql

# Load sample data
python scripts/load_sample_data.py
```

## 📁 Project Structure

```
sage/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── core/           # Configuration
│   │   ├── db/             # Database setup
│   │   ├── ml/             # NLP engine
│   │   ├── models/         # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── main.py             # FastAPI app
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API clients
│   │   ├── styles/        # Zen design system
│   │   └── types/         # TypeScript types
│   └── package.json       # Node dependencies
├── migrations/            # Database migrations
├── data/                 # Sample data
├── scripts/              # Utility scripts
├── docs/                 # Project documentation
└── docker-compose.yml    # Container orchestration
```

## 🧠 Core Features

### Natural Language Processing

- **Intent Classification**: Recognizes search, education, safety, and dosage queries
- **Entity Extraction**: Identifies conditions, effects, cannabinoids, time preferences
- **Semantic Search**: Vector similarity matching with 384-dimensional embeddings
- **Requirement Mapping**: Converts user needs to product requirements

### Zen Design Philosophy

- **Calming Colors**: Nature-inspired sage greens and earth tones
- **Generous Whitespace**: Breathing room to reduce visual stress
- **Gentle Animations**: Smooth, non-jarring transitions
- **Warm Language**: Encouraging, non-judgmental tone
- **Progressive Disclosure**: Information unfolds naturally

### Privacy Levels

1. **Anonymous**: No data storage, basic search only
2. **Session**: Temporary memory, conversation context
3. **Local**: Browser storage, persistent preferences
4. **Account**: Full personalization, cloud sync

### Compliance Features

- Age verification for THCA products (21+ in NC)
- THC limit checking (0.3% federal limit)
- Lab testing requirements
- Privacy-compliant data handling

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### API Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test NLP processing
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"text": "I need help with sleep", "session_id": "test-123"}'
```

## 📊 Sample Data

The project includes 10 sample hemp products covering:

- **CBD Tinctures**: For anxiety, sleep, general wellness
- **CBG Products**: Focus and energy formulations
- **Topicals**: Pain relief creams and recovery balms
- **Edibles**: Beginner-friendly gummies
- **THCA Flower**: Compliance-aware age-restricted products

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/budguide
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
DEBUG=true
ALLOWED_ORIGINS=["http://localhost:3000"]
```

**Frontend**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Privacy Settings

Configure privacy levels in the UI or via API:

```json
{
  "privacy_level": 2,
  "settings": {
    "share_data": false,
    "analytics": false,
    "store_conversations": true
  }
}
```

## 📈 Development Roadmap

### Phase 1: MVP Foundation ✅
- [x] Basic project structure
- [x] NLP engine implementation
- [x] Database schema with pgvector
- [x] Zen design system
- [x] Docker development environment
- [x] Sample product data

### Phase 2: Core Functionality (In Progress)
- [ ] Chat API endpoints
- [ ] Product search and recommendation
- [ ] Conversation management
- [ ] Privacy level implementation

### Phase 3: Enhanced Features
- [ ] User accounts and preferences
- [ ] Advanced analytics
- [ ] A/B testing framework
- [ ] Enhanced compliance monitoring

### Phase 4: Production Ready
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Production deployment
- [ ] Monitoring and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for BudGuide platform development.

## 🆘 Support

For questions, issues, or feature requests:

1. Check the documentation in `/docs`
2. Review existing issues
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- **Zen Design Inspiration**: Mindfulness and wellness UI/UX principles
- **Hemp Industry**: For creating a space for innovation in wellness
- **Open Source Community**: For the amazing tools that make this possible

---

**Made with 💚 for a calmer path to wellness**