# DecisionMate AI

### AI-Based Personal Decision Support Chatbot

DecisionMate AI is a personal decision support chatbot designed to help users think through real-life choices (careers, internships, tech purchases, learning paths, education, and finances) with clarity, multi-criteria comparison, and transparent trade-offs.

Instead of generic motivational answers or blindly making choices for users, DecisionMate AI acts as a **smart friend**:
- Detects the decision type and extracts candidate options
- Checks for missing information and asks at most **1–3 concise follow-up questions**
- Discovers the user's actual target goals and priorities
- Dynamically generates weighted criteria tailored to the dilemma (e.g. GPU/CPU for laptops; career relevance, real projects & stipend for internships)
- Delivers a structured recommendation adhering strictly to the **Section 13 Decision Support Format**:
  - Clear recommended choice
  - Why (key decisive reasons)
  - Strengths (+) & Weaknesses (-) breakdown for all options
  - Main Trade-off analysis
  - Risks & Missing Information
  - Actionable Next Steps
  - Confidence rating (High / Medium / Low)
- Provides a real-time **Decision State Inspector** allowing transparent inspection of extracted variables, criteria weights, and stage progress.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

From the project root:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Running the Application

You can run both backend and frontend concurrently:

```bash
# In the root directory:
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1 - Backend Server (runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2 - Frontend Client (runs on http://localhost:5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

DecisionMate AI includes automated tests covering the required scenarios:

```bash
# Run backend test suite
cd backend
npm test
```

Test scenarios covered:
1. **Missing Options Detection**: `Which internship should I choose?` -> Prompts for options, no premature recommendation.
2. **Multi-Turn Internship Alignment**: Company A (AI, 10k) vs Company B (Web, 20k) with Goal "Become an AI Engineer" -> Recommends Company A, notes compensation trade-off.
3. **Product Purchase**: Laptops with GPU/RAM specs evaluated against AI compute criteria.
4. **Learning Path**: Python vs Java evaluated against career goal and practicality.
5. **Section 13 Format Conformance**: Asserts all mandatory sections (`### Recommendation`, `### Why`, `### Comparison`, `### Main Trade-off`, `### Risks / Missing Information`, `### Next Step`, `### Confidence`).

---

## 🔌 API Endpoints

### 1. `POST /api/chat`
Main conversational endpoint.
```json
{
  "message": "Which internship should I choose?",
  "conversationId": "conv_123"
}
```
Response:
```json
{
  "reply": "I can help compare your choices, but I need the actual options first...",
  "conversationId": "conv_123",
  "state": {
    "decisionType": "internship",
    "stage": "clarifying",
    "options": [],
    "missingInformation": ["options"]
  }
}
```

### 2. `POST /api/decision/analyze`
Direct structured state analyzer.
```json
{
  "decision": {
    "question": "Which internship?",
    "decisionType": "internship",
    "options": [
      { "name": "Company A", "role": "AI Intern", "stipend": "₹10,000" },
      { "name": "Company B", "role": "Web Intern", "stipend": "₹20,000" }
    ],
    "goal": "Become an AI Engineer"
  }
}
```

### 3. `GET /api/decision/state/:conversationId`
Inspect the live decision state and history for a given conversation.

### 4. `POST /api/chat/reset`
Clears conversation memory and resets the decision state.

### 5. `GET /api/health`
Health check endpoint (`{ "status": "ok" }`).

---

## ⚙️ AI Engine & Offline Readiness

DecisionMate AI comes equipped with a triple-engine AI provider architecture:
1. **Smart Local Engine (Default)**: Fully offline-ready, deterministic multi-criteria decision engine. Guarantees 0-latency execution, zero hallucination of options, strict 1-3 follow-up enforcement, and zero repetitive buzzwords.
2. **Google Gemini API**: Configurable via `GEMINI_API_KEY` in `backend/.env` or in-app Settings modal (`gemini-1.5-flash`).
3. **OpenAI API**: Configurable via `OPENAI_API_KEY` in `backend/.env` or in-app Settings modal (`gpt-4o-mini`).

---

## 🌐 Deploy to Vercel

DecisionMate AI is fully pre-configured for **1-click zero-config deployment on Vercel**:
- **Serverless API**: `api/index.ts` automatically runs Express routes on Vercel Serverless Functions.
- **Frontend SPA**: `frontend/dist` is served with client-side SPA routing via `vercel.json`.

### Steps:
1. Push your latest code to your GitHub repo (`https://github.com/harshgorlewar34-jpg/DecisionMate-AI`).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New...** > **Project**.
4. Import your **`DecisionMate-AI`** repository.
5. In **Build and Output Settings**, Vercel will automatically detect:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
6. *(Optional)* In **Environment Variables**, add:
   - `GEMINI_API_KEY` (if using Google Gemini)
   - `OPENAI_API_KEY` (if using OpenAI)
7. Click **Deploy**!

---

## 🛡️ Decision Support Disclaimer

DecisionMate AI is designed to assist personal decision making by structuring trade-offs and options. It does not replace certified professional legal, medical, or high-stakes financial counsel.
