# 🌿 NeuraWell — AI Mental Wellness Sanctuary

> A calm, private, state-of-the-art AI mental wellness sanctuary featuring real-time emotion analysis, evidence-based Cognitive Behavioral Therapy (CBT) reframing, Web Audio soundscapes, and clinical crisis safety engineering.

---

## 📌 Project Details

- **Project Title**: NeuraWell — AI Mental Wellness Sanctuary
- **Team Name**: Matrix

---

## ❓ Problem Statement

Mental health challenges like anxiety, burnout, and acute emotional distress affect over 1 in 4 people globally. However:
1. **High Barrier to Entry**: Traditional therapy is frequently expensive and inaccessible with long waiting lists.
2. **Midnight Isolation**: Panic attacks and high stress frequently strike outside clinical hours when support is unavailable.
3. **Stigma & Fear**: Individuals often hesitate to share raw thoughts due to social stigma or fear of judgment.
4. **Lack of Immediate Grounding Tools**: People experiencing anxiety lack immediate, interactive self-regulation tools (such as sensory grounding exercises and CBT thought reframing) in a single unified platform.

---

## 💡 Solution Overview

**NeuraWell** bridges this gap by offering an instant, private, non-clinical AI sanctuary available 24/7. 

### Core Platform Features
- 💬 **Chat Sanctuary**: Real-time SSE streaming AI conversation powered by LangChain & OpenAI GPT-4o with automatic 3-step actionable grounding plans and hands-free voice dictation.
- 📖 **Reflective Journal Mode**: Confidential journaling space with guided reflection prompts, emotional tag tracking, energy level logging (1-5), daily streak stats, and searchable history.
- 🧠 **CBT Thought Reframer**: Evidence-based Cognitive Behavioral Therapy workspace that identifies cognitive distortions (*Catastrophizing*, *Mind Reading*, *All-or-Nothing*) and synthesizes 3 balanced reframes.
- 🎧 **Web Audio Calm Soundscapes**: 100% offline ambient audio synthesis (*Emerald Rain*, *Deep Forest Wind*, *Calm Ocean Waves*, *432Hz Healing Frequency*).
- ✨ **Gamified Daily Quests**: Mindful micro-habits and XP tracking to build daily mental wellness routines.
- 🫁 **Breathing Sanctuary**: Interactive visual breathing guides (Box 4-4-4-4, 4-7-8, Resonant 5.5-5.5).
- 🚨 **SOS Emergency Safety Toolkit**: Interactive 5-4-3-2-1 Sensory Grounding Guide and 24/7 global crisis helplines (US 988, UK 111, India Tele-MANAS, EU 112).
- 📄 **Printable Therapist Report**: 1-click generator for clinical-grade summaries of 14-day mood severity trends and journal logs.

---

## 🌐 Live Demonstration Link

- **Frontend Application (Vercel)**: [https://neura-well-hack-matrix2026.vercel.app](https://neura-well-hack-matrix2026.vercel.app) 

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (Turbopack, App Router)
- **UI & Styling**: React 19, Vanilla CSS Custom Design Tokens, Tailwind CSS, Framer Motion
- **Icons & Visuals**: Lucide React Icons, Custom Midnight Emerald & Sage Glassmorphic Theme
- **Browser APIs**: Web Audio API (Offline Audio Synthesis), Web Speech API (Hands-Free Dictation)

### Backend & AI
- **Framework**: Python 3.10+, Flask, Flask-CORS, Gunicorn
- **AI Orchestration**: LangChain, LangChain-OpenAI
- **LLM Models**: OpenAI `gpt-4o`, `gpt-3.5-turbo` with Structured Function Calling
- **Streaming**: Server-Sent Events (SSE) `text/event-stream`

---

## 👥 Team Members

- Jayanta Ghosh
- Lahari Basak

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- **Node.js**: v18+ installed
- **Python**: v3.10+ installed

---

### 1. Backend Setup & Run (Flask API)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create & activate a Python virtual environment:
   - **Windows**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend/` directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. Run the Flask backend server:
   ```bash
   python app.py
   ```
   > Backend server starts on `http://127.0.0.1:5000`

---

### 2. Frontend Setup & Run (Next.js)

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the `frontend/` directory (optional):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   > Frontend application starts on `http://localhost:3000`

---

### 🌐 Access the Application
Open your browser and visit **[http://localhost:3000](http://localhost:3000)**.