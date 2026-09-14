# Arena.AIML — AI-Powered Event Management & Engagement Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/React-19.2.8-blue)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2.0-646CFF)](https://vitejs.dev)
[![Node](https://img.shields.io/badge/Node-v22-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey)](https://expressjs.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC)](https://tailwindcss.com)

**Arena.AIML** is a modern, full-stack, AI-powered event management and engagement platform tailored for academic institutions, hackathons, technical conferences, and student communities.

---

## 🏗️ System Architecture

```
                                 ARENA.AIML
                                      |
                                   AI HUB
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
      CREATION                     ANALYSIS                    ASSISTANCE
         |                            |                            |
   +-----+-----+                +-----+-----+                +-----+-----+
   |     |     |                |           |                |           |
 Poster Copy Email           Feedback   Analytics         Chatbot Recommendations
         |
   Prompt Engineering System (Central Registry + JSON Schemas + Versioning)
         |
   AI Service Coordinator (Retry, Caching, Usage Tracking, Provider Fallback)
         |
   Modular Model Providers Layer (Google Gemini, OpenAI, Diffusion Image Generation, Mock)
```

---

## 🚀 Key Modules in the AI Hub

### 1. 🎨 AI Poster Generator (`/ai-hub/poster`)
- Generates high-resolution, thematic event posters using diffusion models and visual prompt engineering.
- **Aesthetic Styles**: Modern Abstract 3D, Cyberpunk / Neon, Swiss Minimalist, Retro Risograph, Playful 3D Clay, Executive Summit.
- **Aspect Ratios**: Square (1:1), Portrait Poster (2:3), Landscape Web Banner (16:9).
- **Features**: One-click prompt customization, regenerate with new seeds, direct image download, and generation history.

### 2. 📝 AI Event Copywriter (`/ai-hub/description`)
- Synthesizes structured event collateral from rough briefs.
- **Generated Outputs**:
  - Punchy Elevator Pitch (Short Description)
  - Multi-paragraph Full Description
  - Bullet-point Highlights
  - Social Media Caption with Emojis
  - Action-Oriented Call to Action
  - SEO-Optimized Meta Description & Hashtags
- **Features**: 1-Click field copy and "Copy All" bundle.

### 3. 📧 AI Email Studio & Campaign Dispatcher (`/ai-hub/email`)
- Generates responsive HTML and matching plain-text email templates.
- **Email Types Supported**: Invitations, Announcements, Reminders, Confirmations, Promotional blasts, Thank-You notes, and Feedback requests.
- **Safety Workflow**:
  1. Generate template -> 2. Preview live rendered HTML -> 3. Edit code or subject -> 4. Select recipient audience -> 5. **Explicit User Confirmation Dialog** -> 6. Dispatch & Log.
- **Transports**: Nodemailer SMTP with Ethereal preview fallback.

### 4. 🤖 Arena AI Concierge & Chatbot (`/ai-hub/chat` & Floating Widget)
- Interactive conversational assistant grounded in authoritative database records.
- **Anti-Hallucination Grounding**: Retrieves real-time event schedules, venues, and registration criteria from MongoDB.
- **Features**: Renders interactive event cards directly in chat answers, session history preservation, and quick suggestion prompts.

### 5. ⭐ AI Feedback & Sentiment Analyzer (`/ai-hub/feedback`)
- Ingests qualitative participant feedback and produces structured NLP analytics.
- **Metrics**: Overall Sentiment Index (0-100%), Positive/Neutral/Negative percentage distributions, average star ratings.
- **Thematic Categorization**: Positive highlights, attendee complaints, constructive suggestions, and Priority Action Items (P1, P2) for event organizers.

### 6. 🎯 Multi-Signal Recommendation Engine (`/ai-hub/recommendations`)
- Content-based, explainable recommendation algorithm calculating weighted affinity scores:
  - **Signal 1**: Interest & keyword semantic match (35%)
  - **Signal 2**: Department & category alignment (25%)
  - **Signal 3**: Historical attendance similarity via Jaccard index (15%)
  - **Signal 4**: Event popularity and free registration factor (15%)
  - **Signal 5**: Recency and date urgency (10%)
- **Explainability**: Every recommendation includes a transparent explanation (e.g., *"Matches your interest in AI and previous attendance in Technical events"*).
- **Action**: One-click event registration directly from recommendation cards.

### 7. 🧠 Centralized Prompt Engineering System (`/ai-hub/prompts`)
- Registry managing versioned prompt templates (`EVENT_DESCRIPTION_PROMPT_V1`, `EMAIL_PROMPT_V1`, `POSTER_PROMPT_V1`, `CHATBOT_PROMPT_V1`, `FEEDBACK_ANALYSIS_PROMPT_V1`, `RECOMMENDATION_PROMPT_V1`).
- Enforces strict JSON schemas for guaranteed parseability.
- Interactive Prompt Playground for rapid prompt iteration and testing.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 8, React Router v7, Tailwind CSS v4, Framer Motion, Lucide React, Axios.
- **Backend**: Node.js v22 (CommonJS), Express 5.2, Mongoose 9.9, JWT, bcryptjs, Helmet, Morgan, Nodemailer, Razorpay.
- **Testing**: Jest 30, Supertest 7.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- MongoDB instance (local or MongoDB Atlas)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/gloryyy17/arena.aiml.git
cd arena.aiml

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` in `backend/` to `backend/.env`:
```bash
cd ../backend
cp .env.example .env
```
Fill in the configuration:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/arena_aiml
JWT_SECRET=your_jwt_secret_key_here

# AI Hub Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Optional Email Configuration (Mock mode active if empty)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=Arena AIML <events@arena.aiml>
```

### 3. Run the Application
In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🧪 Running Automated Tests

Run backend unit and integration tests (15 test suites covering AI Service, Prompt Registry, Poster, Email, Chatbot, Feedback, Recommendations, and Security):
```bash
cd backend
npm test
```

Build the frontend bundle:
```bash
cd frontend
npm run build
```

---

## 🔒 Security & Best Practices

1. **Server-Side API Key Isolation**: AI provider secrets (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `SMTP_PASS`) are never exposed to the client.
2. **Input Sanitization**: HTML email outputs are sanitized to prevent script injection before dispatch.
3. **Role-Based Authorization**: AI generative endpoints for posters, emails, and event copy are strictly protected for faculty and admin roles.
4. **Explicit Email Dispatch Confirmation**: Broadcast emails require mandatory user verification (`confirmSend: true`).
5. **Deterministic Schema Enforcement**: Prompts enforce JSON schema validation to guarantee structured responses.

---

## 📄 License
ISC License. Built for Arena.AIML.