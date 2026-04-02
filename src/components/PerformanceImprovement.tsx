"use client";

import { useState, useEffect } from "react";
import { LEVELS } from "@/lib/levelGuide";
import { copyToClipboard, exportPIPtoPDF } from "@/lib/exportUtils";
import { getCompanyContext, CompanyContext } from "@/lib/companyContext";
import ExportBar from "@/components/ExportBar";
import CompanyContextBanner from "@/components/CompanyContextBanner";

interface RoleRequirement {
  requirement: string;
  deliveryOutcome: string;
}

interface WeeklyCheckpoint {
  week: string;
  focus: string;
  checkIn: string;
}

interface PerformancePlan {
  deliveryIssues: string;
  roleRequirements: RoleRequirement[];
  levelContext: string;
  weeklyCheckpoints: WeeklyCheckpoint[];
  consequenceStatement: string;
}

export default function PerformanceImprovement() {
  const [employeeName, setEmployeeName] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [department, setDepartment] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [gapDescription, setGapDescription] = useState("");
  const [strengths, setStrengths] = useState("");
  const [participants, setParticipants] = useState("");

  const [plan, setPlan] = useState<PerformancePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [companyCtx, setCompanyCtx] = useState<CompanyContext>({ companySize: "", companyStage: "", constraints: "" });

  // Refinement state
  const [showRefine, setShowRefine] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    setCompanyCtx(getCompanyContext());
  }, []);

  const levelCodes = LEVELS.map((l) => l.code);

  // Calculate end date (4 weeks from today)
  const getEndDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 28);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const handleGenerate = async () => {
    if (!employeeName || !currentRole || !currentLevel || !targetLevel || !gapDescription.trim()) {
      setError("Please fill in employee name, role, levels, and describe the gaps.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPlan(null);

    try {
      const response = await fetch("/api/performance-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName,
          currentRole,
          department,
          currentLevel,
          targetLevel,
          gapDescription,
          strengths,
          companyContext: companyCtx,
          participants,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate plan");

      const data = await response.json();
      setPlan(data);
    } catch {
      setError("Could not generate performance plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!plan || !refineFeedback.trim()) return;
    setIsRefining(true);
    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalResult: plan,
          refinementFeedback: refineFeedback,
          companyContext: companyCtx,
          contextType: "performance-plan",
        }),
      });

      if (!response.ok) throw new Error("Failed to refine plan");

      const data = await response.json();
      setPlan(data.refined);
      setRefineFeedback("");
      setShowRefine(false);
    } catch {
      setError("Could not refine the plan. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  const buildPlainText = () => {
    if (!plan) return "";
    let text = `${employeeName} — Performance Improvement Plan\n`;
    text += `${"═".repeat(60)}\n`;
    text += `Date: ${getTodayDate()}\n\n`;
    if (participants) text += `Participants: ${participants}\n\n`;
    text += `Employee: ${employeeName}\n`;
    text += `Role: ${currentRole}\n`;
    if (department) text += `Department: ${department}\n`;
    text += `Current Level: ${currentLevel}  ->  Target Level: ${targetLevel}\n`;
    text += `Duration: 4 weeks (until ${getEndDate()})\n\n`;

    if (plan.levelContext) {
      text += `LEVEL CONTEXT\n${"-".repeat(50)}\n${plan.levelContext}\n\n`;
    }

    text += `DELIVERY ISSUES\n${"-".repeat(50)}\n${plan.deliveryIssues}\n\n`;

    text += `EXPECTATIONS & DELIVERY OUTCOMES\n${"-".repeat(50)}\n`;
    for (const req of plan.roleRequirements) {
      text += `\nImprovement: ${req.requirement}\n`;
      text += `Delivery Outcome: ${req.deliveryOutcome}\n`;
    }

    if (plan.weeklyCheckpoints && plan.weeklyCheckpoints.length > 0) {
      text += `\nWEEKLY CHECKPOINTS\n${"-".repeat(50)}\n`;
      for (const w of plan.weeklyCheckpoints) {
        text += `\n${w.week}\n`;
        text += `  Focus: ${w.focus}\n`;
        text += `  Check-in: ${w.checkIn}\n`;
      }
    }

    text += `\n${"-".repeat(50)}\n`;
    text += plan.consequenceStatement || "Failure to meet the expectations and deliverables outlined in this performance improvement plan may result in further disciplinary actions, up to and including termination.";
    text += `\n\n\n____________________ \t\t ________________\n`;
    text += `${employeeName} \t\t\t\t Date\n`;

    return text;
  };

  const handleCopy = () => copyToClipboard(buildPlainText());

  const handleExportPDF = () => {
    if (!plan) return;
    exportPIPtoPDF({
      employeeName,
      currentRole,
      department,
      currentLevel,
      targetLevel,
      participants,
      todayDate: getTodayDate(),
      endDate: getEndDate(),
      levelContext: plan.levelContext,
      deliveryIssues: plan.deliveryIssues,
      roleRequirements: plan.roleRequirements,
      weeklyCheckpoints: plan.weeklyCheckpoints,
      consequenceStatement: plan.consequenceStatement || "Failure to meet the expectations and deliverables outlined in this performance improvement plan may result in further disciplinary actions, up to and including termination.",
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {!plan ? (
        <div className="space-y-6">
          <CompanyContextBanner onContextChange={(ctx) => setCompanyCtx(ctx)} />
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Performance Improvement Plan
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Describe the performance gaps and the AI will generate a focused 4-week PIP
              with specific delivery outcomes tied to the Tiger Data leveling framework.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Employee info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Employee name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Role / Title
                </label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="Role or title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department / Team
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Department or team"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Level
                  </label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
                  >
                    <option value="">Select...</option>
                    {levelCodes.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Level
                  </label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
                  >
                    <option value="">Select...</option>
                    {levelCodes.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Participants — optional */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participants (optional)
              </label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="People involved in the PIP meeting"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
              />
            </div>

            {/* Gap description — the key input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What are the performance gaps?
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Describe the delivery issues and gaps in your own words.
                The AI will map these to the leveling framework and generate
                specific delivery outcomes for a 4-week improvement period.
              </p>
              <textarea
                value={gapDescription}
                onChange={(e) => setGapDescription(e.target.value)}
                placeholder="Describe the performance issues and what this person needs to improve on..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y"
              />
            </div>

            {/* Optional strengths */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Known strengths (optional)
              </label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="What does this person do well?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-[#0a0a0a] text-[#F5FF80] px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating 4-week improvement plan...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  Generate Performance Improvement Plan
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Results View — PIP Format */
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {employeeName} — Performance Improvement Plan
                </h2>
                <p className="text-sm text-gray-500 mt-1">{getTodayDate()}</p>
              </div>
              <button
                onClick={() => setPlan(null)}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg transition-colors"
              >
                Edit
              </button>
            </div>

            {participants && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Participants</p>
                <p className="text-sm text-gray-700">{participants}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-semibold text-gray-900">{currentRole}</p>
              </div>
              {department && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-semibold text-gray-900">{department}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Current → Target</p>
                <p className="text-sm font-semibold text-gray-900">{currentLevel} → {targetLevel}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-semibold text-gray-900">4 weeks</p>
                <p className="text-xs text-gray-400">Until {getEndDate()}</p>
              </div>
            </div>

            {/* Level Context */}
            {plan.levelContext && (
              <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4">
                <p className="text-xs font-medium text-[#F5FF80] mb-1">Level Context</p>
                <p className="text-sm text-gray-300 leading-relaxed">{plan.levelContext}</p>
              </div>
            )}
          </div>

          {/* Your Input — collapsible */}
          <details className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
            <summary className="px-6 py-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors">
              <span className="text-sm font-semibold text-gray-900">Your Input</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="px-6 pb-5 border-t border-gray-100 pt-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Performance gaps described</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{gapDescription}</p>
              </div>
              {strengths && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Known strengths</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{strengths}</p>
                </div>
              )}
            </div>
          </details>

          {/* Delivery Issues */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Delivery Issues</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{plan.deliveryIssues}</p>
          </div>

          {/* Improvements → Delivery Outcomes Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#0a0a0a] px-6 py-3">
              <h3 className="text-sm font-semibold text-[#F5FF80]">
                Expectations over the next 4 weeks, until {getEndDate()}
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {/* Table header */}
              <div className="grid grid-cols-2 gap-0">
                <div className="px-6 py-3 bg-gray-50 border-r border-gray-200">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Improvements</p>
                </div>
                <div className="px-6 py-3 bg-gray-50">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Delivery Outcomes</p>
                </div>
              </div>
              {/* Table rows */}
              {plan.roleRequirements.map((req, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-0">
                  <div className="px-6 py-4 border-r border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                      {req.requirement}
                    </p>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {req.deliveryOutcome}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Checkpoints */}
          {plan.weeklyCheckpoints && plan.weeklyCheckpoints.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Checkpoints</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.weeklyCheckpoints.map((w, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-[#F5FF80] flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">{w.week}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">Focus</p>
                        <p className="text-gray-600">{w.focus}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">Manager Check-in</p>
                        <p className="text-gray-600">{w.checkIn}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consequence Statement */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              {plan.consequenceStatement || "Failure to meet the expectations and deliverables outlined in this performance improvement plan may result in further disciplinary actions, up to and including termination."}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-12">
              <div>
                <div className="border-b border-gray-400 w-48 mb-1" />
                <p className="text-sm text-gray-600">{employeeName}</p>
              </div>
              <div>
                <div className="border-b border-gray-400 w-32 mb-1" />
                <p className="text-sm text-gray-600">Date</p>
              </div>
            </div>
          </div>

          {/* Refine Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {!showRefine ? (
              <button
                onClick={() => setShowRefine(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Refine this plan — something doesn&apos;t fit our setup
              </button>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Refine this plan
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Tell the AI what doesn&apos;t work and it will adapt the recommendations.
                </p>
                <textarea
                  value={refineFeedback}
                  onChange={(e) => setRefineFeedback(e.target.value)}
                  placeholder="What needs to change?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y mb-3"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowRefine(false); setRefineFeedback(""); }}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRefine}
                    disabled={isRefining || !refineFeedback.trim()}
                    className="px-4 py-2 bg-[#0a0a0a] text-[#F5FF80] text-sm font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isRefining ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Refining...
                      </>
                    ) : (
                      "Refine Plan"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Fixed Export Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-6 py-3 z-50">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                {employeeName} — <span className="text-gray-900">4-week PIP ({currentLevel} → {targetLevel})</span>
              </span>
              <ExportBar
                onCopy={handleCopy}
                onExportPDF={handleExportPDF}
                copyLabel="Copy Plan"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
