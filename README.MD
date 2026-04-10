# 🎓 Eduvia — AI-Powered Learning Path Dashboard

> **36-Hour Hackathon Project | Team: Navirazz | Track: Smart Campus | April 2026**

Eduvia is an AI-powered learning platform that analyzes your skills, identifies career gaps, and generates a personalized roadmap — powered by Claude AI (Anthropic).

---

## 🚀 Live Demo Flow

1. **Landing Page** → Get Started
2. **Register** as Student or Mentor
3. **Onboarding** (3 steps):
   - Select your Career Goal (Full Stack Developer, DevOps Engineer, etc.)
   - Select skills you already have
   - Add course links or upload a certificate PDF
4. **Claude AI** extracts your skills, identifies gaps, and generates a 3-phase roadmap
5. **Dashboard** shows real-time data — Skills Radar, Skill Gap Heatmap, Roadmap Board, Courses, Notifications

---

## ✨ Features

| Feature | Description |
|---|---|
|  Claude AI Skill Extraction | Upload PDF certificates → Claude extracts skills automatically |
|  AI Roadmap Generation | 3-phase personalized learning path with real course resources |
|  Skills Radar Chart | Current vs Required proficiency visualized |
|  Skill Gap Heatmap | Weakest areas highlighted in red |
|  Progress Timeline | Skills growth tracked over time |
|  Goal-Anchored Advice | Every recommendation tied to your career goal |
|  Smart Notifications | AI-generated nudges based on your real skill gaps |
|  JWT Authentication | Secure login with role-based access (Student / Mentor) |

---

## 🛠️ Tech Stack

### Frontend
- React.js + Vite
- TailwindCSS
- Recharts (Skills Radar, Heatmap, Timeline)
- React Router DOM


### Backend
- Python FastAPI
- PyPDF2 (PDF text extraction)
- CORS Middleware

### AI / NLP
- Claude API by Anthropic (`claude-sonnet-4-20250514`)
- Skill extraction engine
- Gap analysis engine
- Roadmap generation engine

### Database & Infra
- PostgreSQL
- SQLAlchemy ORM

---



## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/eduvia.git
cd eduvia
```

### 2. Backend Setup
```bash
cd eduvia-backend
python -m venv venv
venv\Scripts\activate        
# source venv/bin/activate   

pip install -r requirements.txt
```

Create a `.env` file in `eduvia-backend/`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost/eduvia
SECRET_KEY=your_secret_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
```

Run the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd eduvia-frontend
npm install
npm run dev
```

App runs at: `http://localhost:8080`

---

## 🔄 How It Works

```
Student uploads PDF / pastes course links
            ↓
PyPDF2 extracts text from the file
            ↓
FastAPI sends profile + career goal → Claude API
            ↓
Claude extracts skills + identifies ranked gaps
            ↓
Claude generates 3-phase roadmap with resources
            ↓
Skills & Roadmap saved to PostgreSQL
            ↓
Dashboard renders: Radar Chart, Heatmap, Roadmap Board
```

---


## 🧠 Claude AI Integration

Eduvia uses two Claude API calls per user session:

**1. Skill Extraction Prompt**
- Input: PDF text + career goal
- Output: Extracted skills with proficiency scores + skill gaps with priority

**2. Roadmap Generation Prompt**
- Input: Extracted skills + gaps + career goal
- Output: 3-phase roadmap with resources (real URLs), milestones, and duration

> Model used: `claude-sonnet-4-20250514` | Max tokens: 1500–2000 per call

---

## 📸 Screenshots

| Page | Preview |
|---|---|
| Dashboard | ![Dashboard](screenshots/dashboard.png) |
| Roadmap | ![Roadmap](screenshots/roadmap.png) |
| Courses | ![Courses](screenshots/courses.png) |
| AI Recommendations | ![AI](screenshots/ai%20recommendation.png) |
| Login | ![Login](screenshots/login.png) |

---

## 🔮 Future Scope

- **Phase 2:** Peer skill benchmarking, employer-verified badges, mobile app
- **Phase 3:** LinkedIn/GitHub/Coursera API integration, job role auto-matching
- **Phase 4:** Federated learning, SDK for LMS platforms, global rollout

---

## 👥 Team

**Team Navirazz** — Built with ❤️ in 36 hours

---

