import { useState, useEffect } from 'react';
import { Upload, FileText, Briefcase, AlertCircle, CheckCircle, Zap, TrendingUp } from 'lucide-react';

// Declare PDF.js global
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface AnalysisResult {
  matchScore: number;
  matchPercentage: string;
  strengths: Array<{
    title: string;
    description: string;
    relevance: string;
  }>;
  weaknesses: Array<{
    title: string;
    description: string;
    impact: string;
    severity: string;
  }>;
  keywordMissing: string[];
  improvementSuggestions: Array<{
    area: string;
    currentIssue: string;
    recommendation: string;
    impact: string;
    priority: string;
  }>;
  hiringChanceAnalysis: {
    currentChance: string;
    potentialChance: string;
    timeToImprove: string;
  };
  resumeOptimizationTips: string[];
  competitorAdvantage: string;
  interviewPrep: string[];
}

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [pdfReady, setPdfReady] = useState(false);

  // Initialize PDF.js when component mounts
  useEffect(() => {
    const initializePDF = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        setPdfReady(true);
      } else {
        // Retry after a short delay if PDF.js isn't loaded yet
        setTimeout(initializePDF, 100);
      }
    };

    initializePDF();
  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    if (!pdfReady) {
      throw new Error('PDF.js is not ready yet. Please try again.');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let currentY = -1;
        let lineText = '';

        textContent.items.forEach((item: any) => {
          const itemY = Math.round(item.transform[5]);

          if (currentY !== -1 && Math.abs(currentY - itemY) > 2) {
            if (lineText.trim()) {
              fullText += lineText.trim() + '\n';
            }
            lineText = '';
          }

          if (item.str.trim()) {
            lineText += (lineText ? ' ' : '') + item.str;
          }

          currentY = itemY;
        });

        if (lineText.trim()) {
          fullText += lineText.trim() + '\n';
        }
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const handleResumeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let text = '';

      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        text = await file.text();
      }

      setResumeText(text);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again or paste the text manually.');
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      alert('Please provide both resume and job description');
      return;
    }

    if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      alert('Please set your Gemini API key in the .env file');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert recruiter and career coach. Analyze the following resume against the job description and provide a detailed analysis in JSON format.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please provide analysis in this exact JSON structure:
{
  "matchScore": (0-100),
  "matchPercentage": "X%",
  "strengths": [
    {
      "title": "skill/experience name",
      "description": "why this is a strength",
      "relevance": "how it matches the job"
    }
  ],
  "weaknesses": [
    {
      "title": "missing skill/experience",
      "description": "why it's a weakness",
      "impact": "how critical is this for the role",
      "severity": "high/medium/low"
    }
  ],
  "keywordMissing": ["keyword1", "keyword2"],
  "improvementSuggestions": [
    {
      "area": "section name",
      "currentIssue": "what's missing or weak",
      "recommendation": "specific action to take",
      "impact": "expected benefit",
      "priority": "high/medium/low"
    }
  ],
  "hiringChanceAnalysis": {
    "currentChance": "X%",
    "potentialChance": "Y%",
    "timeToImprove": "estimated time"
  },
  "resumeOptimizationTips": [
    "tip 1",
    "tip 2"
  ],
  "competitorAdvantage": "What would make you stand out from other candidates",
  "interviewPrep": [
    "question you should prepare for",
    "another question"
  ]
}

Provide ONLY valid JSON, no additional text.`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response format');
      }

      const jsonText = data.candidates[0].content.parts[0].text;
      const jsonData = JSON.parse(jsonText);
      setAnalysis(jsonData);
      setActiveTab('results');
    } catch (error) {
      console.error('Error:', error);
      alert('Analysis failed. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Resume Job Match Analyzer</h1>
          <p className="text-purple-200 text-lg">AI-powered recruiter analysis to optimize your job applications</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'upload'
              ? 'bg-purple-500 text-white'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
          >
            <Upload className="inline mr-2" size={20} /> Upload & Input
          </button>
          {analysis && (
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'results'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
            >
              <TrendingUp className="inline mr-2" size={20} /> Analysis Results
            </button>
          )}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Resume Upload */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-purple-400" size={24} />
                <h2 className="text-2xl font-bold text-white">Your Resume</h2>
              </div>
              <div className="mb-4">
                <label className="block text-slate-300 mb-2 text-sm font-medium">Upload Resume File (TXT/PDF)</label>
                <input
                  type="file"
                  onChange={handleResumeFile}
                  accept=".txt,.pdf"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
                {!pdfReady && (
                  <p className="text-yellow-400 text-xs mt-1">PDF.js is loading... PDF files will be available shortly.</p>
                )}
              </div>
              <div className="bg-slate-700 rounded-lg p-4 mb-4 h-64 overflow-auto">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Or paste your resume content here..."
                  className="w-full h-full bg-transparent text-slate-100 focus:outline-none resize-none text-sm"
                />
              </div>
              <p className="text-slate-400 text-xs">{resumeText.length} characters</p>
            </div>

            {/* Job Description */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="text-blue-400" size={24} />
                <h2 className="text-2xl font-bold text-white">Job Description</h2>
              </div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">Paste the Job Description</label>
              <div className="bg-slate-700 rounded-lg p-4 h-80 overflow-auto">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  className="w-full h-full bg-transparent text-slate-100 focus:outline-none resize-none text-sm"
                />
              </div>
              <p className="text-slate-400 text-xs mt-4">{jobDescription.length} characters</p>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && analysis && (
          <div className="space-y-6">
            {/* Match Score */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-lg mb-2">Overall Match Score</p>
                  <h2 className="text-5xl font-bold">{analysis.matchPercentage}</h2>
                  <p className="text-purple-100 mt-2">Current hiring chance: {analysis.hiringChanceAnalysis.currentChance}</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-4xl font-bold">{analysis.matchScore}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Potential Improvement */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">🚀 Growth Potential</h3>
              <p className="mb-2">With improvements, you can reach: <span className="text-2xl font-bold">{analysis.hiringChanceAnalysis.potentialChance}</span></p>
              <p className="text-emerald-100">Estimated time: {analysis.hiringChanceAnalysis.timeToImprove}</p>
            </div>

            {/* Strengths */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="text-green-400" size={24} />
                <h3 className="text-2xl font-bold text-white">Your Strengths</h3>
              </div>
              <div className="space-y-4">
                {analysis.strengths.map((strength: any, idx: number) => (
                  <div key={idx} className="bg-slate-700 rounded-lg p-4 border-l-4 border-green-500">
                    <h4 className="text-lg font-semibold text-green-300 mb-2">{strength.title}</h4>
                    <p className="text-slate-300 text-sm mb-2">{strength.description}</p>
                    <p className="text-slate-400 text-xs">✓ {strength.relevance}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-red-400" size={24} />
                <h3 className="text-2xl font-bold text-white">Areas for Improvement</h3>
              </div>
              <div className="space-y-4">
                {analysis.weaknesses.map((weakness: any, idx: number) => (
                  <div key={idx} className="bg-slate-700 rounded-lg p-4 border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-red-300">{weakness.title}</h4>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${weakness.severity === 'high' ? 'bg-red-900 text-red-200' :
                        weakness.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-blue-900 text-blue-200'
                        }`}>
                        {weakness.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{weakness.description}</p>
                    <p className="text-slate-400 text-xs">Impact: {weakness.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-yellow-400" size={24} />
                <h3 className="text-2xl font-bold text-white">Improvement Recommendations</h3>
              </div>
              <div className="space-y-4">
                {analysis.improvementSuggestions.map((suggestion: any, idx: number) => (
                  <div key={idx} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-purple-300">{suggestion.area}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${suggestion.priority === 'high' ? 'bg-red-900 text-red-200' :
                        suggestion.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-green-900 text-green-200'
                        }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2"><strong>Current Issue:</strong> {suggestion.currentIssue}</p>
                    <p className="text-slate-300 text-sm mb-2"><strong>Action:</strong> {suggestion.recommendation}</p>
                    <p className="text-slate-400 text-xs"><strong>Expected Impact:</strong> {suggestion.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Keywords to Add</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keywordMissing.map((keyword: string, idx: number) => (
                  <span key={idx} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume Tips */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Resume Optimization Tips</h3>
              <ul className="space-y-2">
                {analysis.resumeOptimizationTips.map((tip: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-slate-300">
                    <span className="text-purple-400 font-bold">{idx + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Competitive Advantage */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">🏆 Stand Out from Competitors</h3>
              <p className="text-lg">{analysis.competitorAdvantage}</p>
            </div>

            {/* Interview Prep */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Interview Preparation</h3>
              <div className="space-y-3">
                {analysis.interviewPrep.map((question: string, idx: number) => (
                  <div key={idx} className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-200"><strong>Q{idx + 1}:</strong> {question}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyze Another Button */}
            <button
              onClick={() => {
                setAnalysis(null);
                setActiveTab('upload');
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg transition text-lg"
            >
              Analyze Another Position
            </button>
          </div>
        )}

        {/* Analyze Button */}
        {!analysis && activeTab === 'upload' && (
          <button
            onClick={analyzeResume}
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-lg transition ${loading
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              }`}
          >
            {loading ? 'Analyzing...' : '🔍 Analyze Resume vs Job Description'}
          </button>
        )}
      </div>
    </div>
  );
}