// ResumeAnalysis.js
import React from "react";
import { CheckCircle, XCircle, Calendar, Lightbulb } from "lucide-react";

export default function ResumeAnalysis({ analysis }) {
  if (!analysis) return null;

  let parsed;
  try {
    parsed = JSON.parse(analysis);
  } catch {
    return (
      <pre className="bg-red-100 p-4 rounded-lg text-red-700">
        {analysis}
      </pre>
    );
  }

  const { existing_skills, missing_skills, roadmap } = parsed;

  return (
    <div className="max-w-5xl mx-auto my-10 space-y-10">
      {/* Skills Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700">
            <CheckCircle /> Existing Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {existing_skills.map((skill, i) => (
              <span
                key={i}
                className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-700">
            <XCircle /> Missing Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {missing_skills.map((skill, i) => (
              <span
                key={i}
                className="bg-red-100 text-red-800 px-4 py-1 rounded-full text-sm font-medium shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-700">
          <Calendar /> 6-Month Roadmap
        </h3>
        <div className="relative border-l-4 border-blue-300 pl-6 space-y-8">
          {roadmap.map((step, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-3 top-1 w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow"></div>
              <h4 className="font-semibold text-lg mb-1">
                Month {step.month}: {step.task}
              </h4>
              <p className="text-gray-700 text-sm mb-1">
                📚 <strong>Resource:</strong> {step.resource}
              </p>
              <p className="text-gray-700 text-sm">
                📝 <strong>Deliverable:</strong> {step.deliverable}
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
          <li>Practice and build projects to apply new skills.</li>
          <li>Network and collaborate in developer and design communities.</li>
          <li>Stay updated with new front-end trends & technologies.</li>
          <li>Highlight transferable skills like problem-solving & teamwork.</li>
        </ul>
      </div>
    </div>
  );
}
