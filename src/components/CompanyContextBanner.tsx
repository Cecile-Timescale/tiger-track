"use client";

import { useState, useEffect } from "react";
import { getCompanyContext, saveCompanyContext, hasCompanyContext, CompanyContext } from "@/lib/companyContext";

interface CompanyContextBannerProps {
  onContextChange?: (ctx: CompanyContext) => void;
}

export default function CompanyContextBanner({ onContextChange }: CompanyContextBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasContext, setHasContext] = useState(false);
  const [companySize, setCompanySize] = useState("");
  const [companyStage, setCompanyStage] = useState("");
  const [constraints, setConstraints] = useState("");

  useEffect(() => {
    const ctx = getCompanyContext();
    setCompanySize(ctx.companySize);
    setCompanyStage(ctx.companyStage);
    setConstraints(ctx.constraints);
    setHasContext(hasCompanyContext());
  }, []);

  const handleSave = () => {
    const ctx = { companySize, companyStage, constraints };
    saveCompanyContext(ctx);
    setHasContext(!!(companySize || companyStage || constraints));
    setIsOpen(false);
    onContextChange?.(ctx);
  };

  const handleClear = () => {
    setCompanySize("");
    setCompanyStage("");
    setConstraints("");
    const ctx = { companySize: "", companyStage: "", constraints: "" };
    saveCompanyContext(ctx);
    setHasContext(false);
    onContextChange?.(ctx);
  };

  return (
    <div className="mb-4">
      {/* Collapsed state */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors ${
          hasContext
            ? "bg-[#0a0a0a] text-[#F5FF80]"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="font-medium">
            {hasContext ? "Company context active" : "Set company context"}
          </span>
          {hasContext && companySize && (
            <span className="text-xs opacity-70">({companySize})</span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded editor */}
      {isOpen && (
        <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs text-gray-500 mb-4">
            This context is used across all AI features so recommendations are realistic
            for your company. Set it once and it applies everywhere.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company size
              </label>
              <input
                type="text"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                placeholder="Number of employees"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company stage
              </label>
              <select
                value={companyStage}
                onChange={(e) => setCompanyStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
              >
                <option value="">Select stage...</option>
                <option value="Pre-seed / Seed">Pre-seed / Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Series C+">Series C+</option>
                <option value="Growth stage">Growth stage</option>
                <option value="Established / Public">Established / Public</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Constraints & context
              </label>
              <textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="Anything the AI should know about your setup..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">
                What teams exist, what you don&apos;t have, reporting structure, etc.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5">
            {hasContext && (
              <button
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear context
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#0a0a0a] text-[#F5FF80] text-sm font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                Save Context
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
