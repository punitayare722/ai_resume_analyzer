// ResumeForm.js
import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Lightbulb,
  UploadCloud,
  FileText,
  Wand2,
} from "lucide-react";

export default function ResumeForm() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  // --- Analyze Resume ---
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    const formData = new FormData();
    formData.append("resume", resumeFile);
    if (jobDescription) formData.append("jd", jobDescription);

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/analyze_resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Backend response:", data);

      let parsed = data.analysis;
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch (err) {
          console.error("Failed to parse analysis JSON:", err);
          parsed = {};
        }
      }

      setAnalysis({
        existing_skills: parsed.existing_skills || [],
        missing_skills: parsed.missing_skills || [],
        roadmap: parsed.roadmap || [],
        recommendations: parsed.recommendations || [],
      });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch analysis. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  // --- Optimize Resume & Download ---
  const handleOptimize = async () => {
    if (!resumeFile || !jobDescription) {
      alert("Upload resume and paste job description first!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jd", jobDescription);

    try {
      setOptimizing(true);
      const response = await fetch("http://127.0.0.1:8000/optimize_resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to generate optimized resume");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "optimized_resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to optimize resume. See console.");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-3xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
          📄 Resume Analyzer
        </h1>

        {/* Upload + Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4">
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
            onClick={handleAnalyze}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow"
          >
            <FileText /> {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          <button
            onClick={handleOptimize}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 shadow"
          >
            <Wand2 /> {optimizing ? "Optimizing..." : "Generate Optimized Resume"}
          </button>
        </div>

        {/* Job Description */}
        {resumeFile && (
          <div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full p-4 rounded-lg border border-gray-300 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 mt-4"
              rows={4}
            />
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6 mt-6">
            {/* Existing Skills */}
            <div className="bg-green-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700">
                <CheckCircle /> Existing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.existing_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-red-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-700">
                <XCircle /> Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-700">
                <Calendar /> 6-Month Roadmap
              </h3>
              <div className="relative border-l-4 border-blue-300 pl-6 space-y-6">
                {analysis.roadmap.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-3 top-1 w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                    <h4 className="font-semibold text-lg mb-1">
                      Month {step.month}: {step.task}
                    </h4>
                    <p className="text-gray-700 text-sm mb-1">
                      📚 <strong>Resource:</strong> {step.resource}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-yellow-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-700">
                <Lightbulb /> Recommendations
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
