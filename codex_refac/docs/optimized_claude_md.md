# CLAUDE.md: AI-First Development Blueprint

> **This file optimizes Claude interactions for maximum development velocity. Read this first, reference specific sections as needed.**

---

## 🎯 PROJECT CORE [ALWAYS READ]

**Project:** [Name] | **Stack:** [e.g., Next.js/TS/Supabase] | **Phase:** [MVP/Beta/Live]  
**Mission:** [One sentence: what you're building and for whom]  
**This Week:** [Current priority - update weekly]

```bash
# Quick Start Commands
npm run dev          # Development
npm run build        # Production build  
npm test            # Run tests
npm run typecheck   # Type checking
```

---

## 🤖 AI COLLABORATION RULES

### Claude Behavior Protocol
- **Think Business First:** Every technical decision must align with user value
- **MVP Mindset:** Ship working > ship perfect
- **Explain While Building:** Teach me the "why" as you implement
- **No Magic:** Avoid complex abstractions I can't maintain alone
- **Incremental:** Small, testable changes over big rewrites

### Context Efficiency Rules
```
📖 ALWAYS Load First:
├── CLAUDE.md (this file)
├── package.json
└── src/types/ (if exists)

📖 Load When Relevant:
├── Component being modified
├── Related test files
├── API routes affected
└── Configuration files

🚫 NEVER Load Unless Explicitly Asked:
├── node_modules/
├── build/, dist/, .next/
├── .git/
└── Entire src/ directory
```

---

## 🏗️ ARCHITECTURE SNAPSHOT

### Current Tech Stack
```typescript
// Core Stack - Update as project evolves
Frontend: [e.g., Next.js 14 + TypeScript + Tailwind]
Database: [e.g., Supabase PostgreSQL]
Auth: [e.g., Supabase Auth + RLS]
Payments: [e.g., Stripe]
Deployment: [e.g., Vercel]
```

### Key Files Map
```
Critical Files:
├── src/app/layout.tsx       # App shell
├── src/app/page.tsx         # Homepage  
├── src/lib/supabase.ts      # Database client
├── src/lib/auth.ts          # Authentication
├── src/components/ui/       # Reusable components
└── src/types/database.ts    # Type definitions
```

### Business Logic Core
```typescript
// Essential Rules - Never Violate
- Users only access their own data
- [Add your specific business rules]
- [Keep this section under 10 lines]
```

---

## ⚡ AI-FIRST DEVELOPMENT WORKFLOW

### Phase 1: AI Planning (REQUIRED)
```
Before any code:
1. "Analyze the requirement and propose 3 implementation approaches"
2. "Explain the tradeoffs for an AI-first coder"  
3. "What could go wrong and how do we prevent it?"
4. Get my approval before proceeding
```

### Phase 2: AI Implementation
```
Implementation Rules:
✅ Write tests that describe the behavior first
✅ Build incrementally - commit after each working piece
✅ Explain complex logic as inline comments
✅ Handle errors gracefully with user-friendly messages
❌ Don't implement features I didn't explicitly request
❌ Don't refactor working code unless asked
```

### Phase 3: AI Teaching
```
After implementation, always provide:
- "What we built and why"
- "How to extend this pattern"
- "When to modify vs rebuild"
- "Red flags to watch for"
```

---

## 🎛️ SMART DEFAULTS

### For New Features
```typescript
// Default patterns - use unless specific reason not to
Error Handling: try/catch with user-friendly messages
Loading States: Skeleton UI or spinner
Forms: react-hook-form + zod validation  
Styling: Tailwind utilities (avoid custom CSS)
State: useState for simple, Zustand for complex
API: tRPC or Next.js API routes with TypeScript
```

### For AI Coding Sessions
```
Session Structure:
1. Quick context refresh (read relevant files)
2. Clarify specific task and success criteria
3. Propose approach and get approval  
4. Implement with explanations
5. Test and validate
6. Document what was learned
```

---

## 🚨 CRITICAL BOUNDARIES

### Never Allow These
```
❌ Security: No API keys in client code, no SQL injection risks
❌ Data: No user data mixing, no unvalidated inputs
❌ Performance: No N+1 queries, no blocking operations
❌ Quality: No untested code in production, no broken types
```

### AI Coaching Areas (Teach Me These)
```
🎓 Help me understand:
- When to optimize vs. when to ship
- How to structure scalable code
- Database design decisions  
- Security best practices
- Performance implications
```

---

## 📈 SUCCESS METRICS

### Technical Health
- [ ] All tests passing
- [ ] TypeScript errors: 0  
- [ ] Build time: < 30s
- [ ] Page load: < 3s

### Development Velocity  
- [ ] Feature delivery: [your target]
- [ ] Bug resolution: [your target]
- [ ] Deployment frequency: [your target]

---

## 🔧 CONTEXT OPTIMIZATION

### Token-Efficient Communication
```
Instead of: "Can you help me build a user authentication system with email/password, social logins, password reset, and session management?"

Use: "Build auth system. Required: email/pass + Google OAuth + password reset. Reference /src/lib/auth.ts for existing patterns."
```

### File Reference Format
```
Efficient: "Read /src/components/UserProfile.tsx and /src/types/user.ts"
Inefficient: "Look at the user profile component and user types"
```

### Status Updates Format
```typescript
// Weekly CLAUDE.md updates (keep under 50 words)
Current Priority: [Specific feature/bug]
Blockers: [Technical/business obstacles]  
Wins: [What shipped this week]
Next: [Immediate next action]
```

---

## 🎯 AI-FIRST MANTRAS

1. **"Explain the Why"** - Help me understand decisions, not just implement them
2. **"Ship and Learn"** - Perfect is the enemy of shipped  
3. **"Context is King"** - The right information beats perfect code
4. **"Teach Through Code"** - Every session should increase my AI-coding skills
5. **"Quality Gates Matter"** - Fast feedback prevents expensive fixes

---

## 📝 QUICK REFERENCE

### Emergency Commands
```bash
# When Claude gets lost
"Re-read CLAUDE.md section [X] and focus on [specific task]"

# When code quality drops  
"Stop. Review the Quality Standards section and restart this task"

# When stuck
"What are 3 different approaches to solve [problem]? Explain tradeoffs."
```

### Context Loading Templates
```
For new features: "Read CLAUDE.md, /src/types/, and [specific component files]"
For bugs: "Read CLAUDE.md and the specific files mentioned in [error/issue]"  
For refactoring: "Read CLAUDE.md architecture section and [target files]"
```

---

*This file is designed for maximum AI collaboration efficiency. Keep it under 500 lines total.*

**Last Updated:** [Date] | **Token Count:** ~[Estimate] | **Status:** [Active/Archived]