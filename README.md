# SkillX-Ray AI

**Discover Your Hidden Skills. Unlock Your Future.**

SkillX-Ray AI is a full-stack multi-agent career intelligence SaaS platform that analyzes PDF resumes and project descriptions to surface hidden capabilities, visualize skill gaps, match ideal career trajectories, and generate personalized 30-day adaptive learning roadmaps.

## Core Features

1. **Resume & Project Analyzer** — Uploads and extracts text from PDF resumes (`pdf-parse`) alongside project narratives.
2. **Hidden Skill Detector** — Uncovers implicit technical, communication, leadership, and problem-solving skills backed by verbatim evidence quotes.
3. **Interactive Skill X-Ray** — Categorizes competencies into Strong, Hidden, Developing, and Missing buckets with interactive Chart.js Radar, Doughnut, and Proficiency vs. Demand visualizations.
4. **AI Career Matching** — Recommends top 3 career paths with match percentages, salary ranges, matched vs. missing skills, and one-click roadmap tailoring.
5. **30-Day Adaptive Learning Roadmap & AI Mentor** — Generates a daily study & hands-on drill schedule with persistent progress tracking and an interactive AI Mentor grounded in your Skill X-Ray profile.

## Five Specialized AI Agents

All agents execute server-side via Google Gemini (`@google/genai`, `gemini-4-hydrogen`) with structured JSON schemas and automatic Demo Mode fallback when `GEMINI_API_KEY` is unavailable:

1. **Resume Analysis Agent**
2. **Hidden Skill Discovery Agent**
3. **Skill Gap Analysis Agent**
4. **Career Matching Agent**
5. **Learning Mentor Agent**

## Local Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:3000`.
