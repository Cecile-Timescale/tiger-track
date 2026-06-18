"use client";

import { useState } from "react";
import {
  COMPETENCY_CATEGORIES,
  SUCCESS_CRITERIA,
  INTERVIEW_QUESTIONS,
  REVIEW_GUIDELINES,
} from "@/lib/barRaiser";
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

type ActiveSection = "competency" | "interview" | "guidelines";

export default function BarRaiser() {
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    "competency"
  );
  const [expandedCompetencies, setExpandedCompetencies] = useState<
    Record<string, boolean>
  >({});

  const toggleCompetency = (compId: string) => {
    setExpandedCompetencies((prev) => ({
      ...prev,
      [compId]: !prev[compId],
    }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Sub-nav pills */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveSection("competency")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            activeSection === "competency"
              ? "bg-[#1A1A1A] text-[#F5FF80]"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Competency Matrix
        </button>
        <button
          onClick={() => setActiveSection("interview")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            activeSection === "interview"
              ? "bg-[#1A1A1A] text-[#F5FF80]"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Interview Questions
        </button>
        <button
          onClick={() => setActiveSection("guidelines")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            activeSection === "guidelines"
              ? "bg-[#1A1A1A] text-[#F5FF80]"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Review Guidelines
        </button>
      </div>

      {/* Competency Matrix Section */}
      {activeSection === "competency" && (
        <div className="space-y-4">
          {COMPETENCY_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-900 px-6 py-4 border-b border-gray-300">
                <h3 className="text-lg font-bold text-[#F5FF80]">
                  {category.name}
                </h3>
              </div>

              {/* Levels Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 w-32">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Low
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Meets
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Exceeds
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUCCESS_CRITERIA.map((level) => {
                      const criteria =
                        level.criteria[category.id as keyof typeof level.criteria];
                      if (!criteria) return null;

                      return (
                        <tr
                          key={level.levelCode}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-[#1A1A1A] text-[#F5FF80] text-xs font-semibold whitespace-nowrap">
                              {level.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {criteria.low}
                          </td>
                          <td className="px-6 py-4 text-gray-900 font-medium">
                            {criteria.meets}
                          </td>
                          <td className="px-6 py-4 text-[#FF5B29] font-medium">
                            {criteria.exceeds}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interview Questions Section */}
      {activeSection === "interview" && (
        <div className="space-y-4">
          {COMPETENCY_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-900 px-6 py-4 border-b border-gray-300">
                <h3 className="text-lg font-bold text-[#F5FF80]">
                  {category.name}
                </h3>
              </div>

              {/* Competencies */}
              <div className="divide-y divide-gray-200">
                {category.competencies.map((competency) => {
                  const isExpanded = expandedCompetencies[competency.id];
                  const questions = INTERVIEW_QUESTIONS[competency.id] || [];

                  return (
                    <div key={competency.id}>
                      {/* Competency Header */}
                      <button
                        onClick={() => toggleCompetency(competency.id)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-semibold text-gray-900 text-left">
                          {competency.name}
                        </h4>
                        <ChevronDown
                          className={`text-gray-600 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Questions */}
                      {isExpanded && (
                        <div className="bg-gray-50 px-6 py-4 space-y-4 border-t border-gray-200">
                          {questions.map((q, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5B29] text-white flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {q.question}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1 italic">
                                    Follow-ups: {q.followUps}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Guidelines Section */}
      {activeSection === "guidelines" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-900 px-6 py-4 border-b border-gray-300">
              <h3 className="text-lg font-bold text-[#F5FF80]">
                Evaluation Rubric
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                Use these guidelines to evaluate interview responses
              </p>
            </div>

            {/* Guidelines Grid */}
            <div className="divide-y divide-gray-200">
              {COMPETENCY_CATEGORIES.flatMap((cat) =>
                cat.competencies.map((comp) => {
                  const guideline = REVIEW_GUIDELINES[comp.id];
                  if (!guideline) return null;

                  return (
                    <div
                      key={comp.id}
                      className="px-6 py-6 hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900 mb-4">
                        {comp.name}
                      </h4>

                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Poor */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="font-medium text-gray-900">
                              Poor
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {guideline.poor}
                          </p>
                        </div>

                        {/* Meets */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="font-medium text-gray-900">
                              Meets
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {guideline.meets}
                          </p>
                        </div>

                        {/* Exceeds */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="font-medium text-gray-900">
                              Exceeds
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {guideline.exceeds}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
