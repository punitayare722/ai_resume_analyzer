// ResumeForm.js
import React, { useState } from "react";
import ResumeAnalysis from "./ResumeAnalysis";
import { UploadCloud, FileText, Send } from "lucide-react";

export default function ResumeForm() {
  const [resumeFile, setResumeFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Summarize Resume
  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/summarize_resume", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      try {
        setSummary(JSON.parse(data.summary));
      } catch {
        setSummary({ raw_text: data.summary });
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Analyze Resume vs Job Description
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jobDescription) return;

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jd", jobDescription);

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/analyze_resume", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
          📄 Resume Analyzer
        </h1>

        {/* Upload Resume */}
        <form
          onSubmit={handleSummarize}
          className="flex flex-col md:flex-row items-center gap-4 mb-6"
        >
          <label className="flex items-center gap-2 cursor-pointer bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg shadow">
            <UploadCloud className="text-blue-600" />
            {resumeFile ? resumeFile.name : "Upload PDF Resume"}
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="hidden"
            />
          </label>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow"
          >
            <FileText /> {loading ? "Processing..." : "Summarize Resume"}
          </button>
        </form>

        {/* Job Description */}
        {resumeFile && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              📌 Paste Job Description
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full p-4 rounded-lg border border-gray-300 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
              rows={5}
            />
            <button
              onClick={handleAnalyze}
              className="mt-3 flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 shadow"
            >
              <Send /> Analyze vs Job Description
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {summary && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              ✅ Resume Summary
            </h2>
            <pre className="bg-gray-50 p-4 rounded-lg shadow-inner overflow-x-auto text-gray-700">
              {JSON.stringify(summary, null, 2)}
            </pre>
          </div>
        )}

        {analysis && (
          <div className="mb-6">
            <ResumeAnalysis analysis={analysis} />
          </div>
        )}
      </div>
    </div>
  );
}
