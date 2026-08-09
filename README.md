# NeuraWell — AI Mental Wellness Sanctuary

**Project Title**: NeuraWell  
**Team Name**: Matrix

---

## 🚀 How to Run the Application

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

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend/` directory with your OpenAI API key:
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