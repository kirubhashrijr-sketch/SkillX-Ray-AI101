import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  CheckCircle2,
  FileText,
  FileUp,
  Loader2,
  Radar,
  ScanSearch,
  Sparkles,
} from 'lucide-react';
import type { AnalysisRecord } from '../../types/skillxray';
import type { WorkspaceTab } from '../Sidebar';

interface AnalysisViewProps {
  activeAnalysis: AnalysisRecord | undefined;
  onAnalysisCreated: (analysis: AnalysisRecord) => void;
  onNavigate: (tab: WorkspaceTab) => void;
}

const SAMPLE_RESUME = `Jordan Patel
San Francisco, CA | Full-Stack & Data Software Engineer

SUMMARY
Software engineer with 3+ years of experience designing React dashboards, Python/Flask & Node.js APIs, and automated data ingestion pipelines.

TECHNICAL SKILLS
Python, TypeScript, React, Flask, Express, PostgreSQL, SQLite, Docker, Chart.js, Git, Tailwind CSS

EXPERIENCE
Software Engineer, NovaMetrics (2023–Present)
- Architected a multi-tenant reporting API serving 40k daily requests with p95 latency under 95ms.
- Reduced onboarding ticket volume by 35% by designing interactive error diagnostics and self-serve CSV validators.
- Mentored 2 junior engineers during a migration from legacy monolith endpoints to typed modular services.`;

const SAMPLE_PROJECTS = `1. Automated Contract & Resume Parser: Built an end-to-end PDF extraction service with fallback OCR heuristics and structured JSON outputs, cutting manual data entry from 15 minutes to 8 seconds.
2. Hackathon Team Lead (48-Hour Sprint): Coordinated 3 developers and 1 designer to deliver a real-time supply chain tracker; resolved schema conflicts and presented the live demo to 6 judges.`;

export function AnalysisView({
  activeAnalysis,
  onAnalysisCreated,
  onNavigate,
}: AnalysisViewProps) {
  const [title, setTitle] = useState('');
  const [targetRole, setTargetRole] = useState('AI Product Engineer');
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [projectDescriptions, setProjectDescriptions] = useState('');
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfNotice, setPdfNotice] = useState<string | null>(null);
  const [latestCreated, setLatestCreated] = useState<AnalysisRecord | null>(
    activeAnalysis ?? null
  );

  async function handlePdfUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPdfNotice(null);
    setExtractingPdf(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/analyze/extract-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = (await res.json()) as {
        filename?: string;
        pages?: number;
        text?: string;
        error?: string;
      };

      if (!res.ok || !data.text) {
        setError(data.error || 'Failed to extract text from PDF.');
        return;
      }

      setResumeFilename(data.filename || file.name);
      setResumeText(data.text);
      setPdfNotice(
        `Extracted ${data.text.length.toLocaleString()} characters from ${data.filename} (${data.pages ?? 1} ${data.pages === 1 ? 'page' : 'pages'}).`
      );
    } catch {
      setError('Failed to upload PDF file. Please verify your connection.');
    } finally {
      setExtractingPdf(false);
    }
  }

  function loadSample() {
    setTitle('Full-Stack & AI Product Evaluation');
    setTargetRole('AI Product Engineer');
    setResumeFilename('jordan_patel_sample_resume.pdf');
    setResumeText(SAMPLE_RESUME);
    setProjectDescriptions(SAMPLE_PROJECTS);
    setPdfNotice('Loaded sample engineering resume and project narratives.');
    setError(null);
  }

  async function handleRunAnalysis(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (resumeText.trim().length < 20 && projectDescriptions.trim().length < 20) {
      setError(
        'Please upload a PDF resume or enter at least 20 characters in Resume Text or Project Descriptions.'
      );
      return;
    }

    setRunningPipeline(true);
    try {
      const res = await fetch('/api/analyze/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          targetRole: targetRole.trim(),
          resumeFilename,
          resumeText: resumeText.trim(),
          projectDescriptions: projectDescriptions.trim(),
        }),
      });
      const data = (await res.json()) as { analysis?: AnalysisRecord; error?: string };

      if (!res.ok || !data.analysis) {
        setError(data.error || 'AI analysis pipeline failed.');
        return;
      }

      setLatestCreated(data.analysis);
      onAnalysisCreated(data.analysis);
    } catch {
      setError('Network error while running AI agents.');
    } finally {
      setRunningPipeline(false);
    }
  }

  const displayed = latestCreated ?? activeAnalysis;

  return (
    <div className="space-y-8">
      {/* Input Workbench */}
      <div className="glass-surface-elevated rounded-2xl p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Resume & Project AI Analyzer
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Upload your PDF resume and add project narratives to run all five SkillX-Ray AI
              agents.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-200 hover:border-blue-500/50 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Load Sample Resume & Projects
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {pdfNotice && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
            <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
            <span>{pdfNotice}</span>
          </div>
        )}

        <form onSubmit={handleRunAnalysis} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="scan-title" className="block text-xs font-medium text-slate-300">
                Analysis Label (Optional)
              </label>
              <input
                id="scan-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Q4 AI Engineer Application"
                className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label htmlFor="target-role" className="block text-xs font-medium text-slate-300">
                Target Career Role
              </label>
              <input
                id="target-role"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., AI Product Engineer, Data Scientist"
                className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* PDF Dropzone */}
          <div>
            <span className="block text-xs font-medium text-slate-300">
              Upload PDF Resume (Automatic Text Extraction)
            </span>
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-6 py-7 text-center hover:border-blue-500/60 transition-colors">
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdfUpload}
                className="sr-only"
              />
              {extractingPdf ? (
                <>
                  <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
                  <p className="mt-2 text-sm font-medium text-slate-200">
                    Extracting text from PDF…
                  </p>
                </>
              ) : (
                <>
                  <FileUp className="h-7 w-7 text-blue-400" />
                  <p className="mt-2 text-sm font-medium text-white">
                    {resumeFilename
                      ? `Uploaded: ${resumeFilename} (click to replace)`
                      : 'Click to upload your PDF resume'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    PDF up to 10 MB · Parsed securely on the server without saving files to disk
                  </p>
                </>
              )}
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label htmlFor="resume-text" className="block text-xs font-medium text-slate-300">
                Resume Text (Extracted or Pasted)
              </label>
              <textarea
                id="resume-text"
                rows={8}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here or upload a PDF above…"
                className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 p-4 text-sm leading-relaxed text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label
                htmlFor="project-descriptions"
                className="block text-xs font-medium text-slate-300"
              >
                Project Descriptions & Achievements (Critical for Hidden Skill Detection)
              </label>
              <textarea
                id="project-descriptions"
                rows={8}
                value={projectDescriptions}
                onChange={(e) => setProjectDescriptions(e.target.value)}
                placeholder="Describe systems you architected, bugs you solved, teams you led, or trade-offs you made…"
                className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 p-4 text-sm leading-relaxed text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-5">
            <p className="text-xs text-slate-400">
              Orchestrates Resume Analysis, Hidden Skill Discovery, Skill Gap, Career Matching &
              Learning Mentor agents.
            </p>
            <button
              type="submit"
              disabled={runningPipeline}
              className="btn-primary-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
            >
              {runningPipeline ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running 5 AI Agents…
                </>
              ) : (
                <>
                  <ScanSearch className="h-4 w-4" />
                  Run 5-Agent Analysis
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results: Agent 1 (Resume Analysis) + Agent 2 (Hidden Skill Detector) */}
      {displayed && (
        <div className="space-y-6">
          {/* Agent Pipeline Confirmation */}
          <div className="glass-surface rounded-2xl p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium text-blue-400">
                Latest Completed Scan · {displayed.title}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                All 5 specialized agents completed ({displayed.modeUsed === 'gemini' ? 'Gemini AI' : 'Demo Intelligence Mode'}).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate('xray')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-medium text-white hover:border-blue-500/50 cursor-pointer"
              >
                <Radar className="h-4 w-4 text-blue-400" />
                Open Interactive Skill X-Ray
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Agent 1: Resume Extraction */}
            <div className="lg:col-span-5 glass-surface rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-blue-400" />
                <h2 className="font-display text-lg font-semibold text-white">
                  Resume Analysis Output
                </h2>
              </div>

              <div>
                <p className="text-xs text-slate-400">Candidate & Experience Level</p>
                <p className="mt-1 text-base font-semibold text-white">
                  {displayed.result.resumeAnalysis.candidateName}
                </p>
                <p className="text-xs text-blue-300">
                  {displayed.result.resumeAnalysis.experienceLevel}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-slate-300">
                {displayed.result.resumeAnalysis.summary}
              </p>

              <div className="border-t border-slate-800/80 pt-4">
                <p className="text-xs font-medium text-slate-400">Technical Skills Identified</p>
                <p className="mt-1.5 text-sm text-slate-200">
                  {displayed.result.resumeAnalysis.technicalSkills.join(' · ')}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4">
                <p className="text-xs font-medium text-slate-400">Soft Skills & Frameworks</p>
                <p className="mt-1.5 text-sm text-slate-300">
                  {[
                    ...displayed.result.resumeAnalysis.softSkills,
                    ...displayed.result.resumeAnalysis.toolsAndFrameworks,
                  ].join(' · ')}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4">
                <p className="text-xs font-medium text-slate-400">Key Achievements</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {displayed.result.resumeAnalysis.keyAchievements.map((ach, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Agent 2: Hidden Skill Detector */}
            <div className="lg:col-span-7 glass-surface rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  <h2 className="font-display text-lg font-semibold text-white">
                    Hidden Skill Detector (Evidence-Backed)
                  </h2>
                </div>
              </div>

              <p className="text-sm text-slate-300">
                {displayed.result.hiddenSkills.synthesisNote}
              </p>

              <div className="divide-y divide-slate-800/80">
                {[
                  ...displayed.result.hiddenSkills.hiddenTechnical,
                  ...displayed.result.hiddenSkills.communication,
                  ...displayed.result.hiddenSkills.leadership,
                  ...displayed.result.hiddenSkills.problemSolving,
                ].map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-2 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-medium text-violet-300">
                          {item.category}
                        </span>
                        <h3 className="font-display text-base font-semibold text-white">
                          {item.skill}
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-semibold text-blue-300 tabular-nums">
                        {item.confidence}% confidence
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      <span className="font-medium text-slate-200">Evidence: </span>
                      {item.evidence}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{item.impactNote}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
