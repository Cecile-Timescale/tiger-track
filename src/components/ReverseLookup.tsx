"use client";

import { useState } from "react";
import {
  LEVELS,
  DIMENSION_LABELS,
  getTrackLabel,
  type Level,
  type TrackType,
} from "@/lib/levelGuide";

export default function ReverseLookup() {
  const [selectedTrack, setSelectedTrack] = useState<TrackType | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const filteredLevels =
    selectedTrack === "all"
      ? LEVELS
      : LEVELS.filter((l) => l.track === selectedTrack);

  const handleDownload = (level: Level) => {
    let content = `TIGER DATA - LEVEL REQUIREMENTS\n`;
    content += `${"=".repeat(50)}\n\n`;
    content += `Level: ${level.code} - ${level.title}\n`;
    content += `Track: ${getTrackLabel(level.track)}\n`;
    content += `Description: ${level.description}\n\n`;

    for (const [key, label] of Object.entries(DIMENSION_LABELS)) {
      const dim = level.dimensions[key as keyof typeof level.dimensions];
      content += `${label.toUpperCase()}\n${"-".repeat(40)}\n`;
      content += `Criteria:\n${dim.criteria}\n\n`;
      content += `Expected Behaviors:\n${dim.expectedBehaviors}\n\n`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tiger-data-level-${level.code}-requirements.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Level Requirements Lookup
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Select a level to view its full requirements across all dimensions.
          Download the requirements to share with managers or include in job
          postings.
        </p>

        {/* Track Filter */}
        <div className="flex gap-2 mb-4">
          {[
            { id: "all" as const, label: "All Levels" },
            { id: "ic" as const, label: "Individual Contributor" },
            { id: "manager" as const, label: "People Manager" },
            { id: "executive" as const, label: "Executive" },
          ].map((track) => (
            <button
              key={track.id}
              onClick={() => {
                setSelectedTrack(track.id);
                setSelectedLevel(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedTrack === track.id
                  ? "bg-[#1A1A1A] text-[#F5FF80]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {track.label}
            </button>
          ))}
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {filteredLevels.map((level) => {
            const trackClass =
              level.track === "ic"
                ? "border-[#F5FF80] bg-[#F5FF80]/15 hover:bg-[#F5FF80]/30"
                : level.track === "manager"
                  ? "border-[#2A2A2A]/30 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10"
                  : "border-[#FF5B29]/40 bg-[#FF5B29]/10 hover:bg-[#FF5B29]/20";
            const isSelected = selectedLevel?.id === level.id;

            return (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? "border-[#1A1A1A] ring-2 ring-[#F5FF80]/40 bg-white"
                    : trackClass
                }`}
              >
                <div className="text-lg font-bold text-gray-900">
                  {level.code}
                </div>
                <div className="text-xs text-gray-600 mt-0.5 leading-tight">
                  {level.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Level Detail */}
      {selectedLevel && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`level-badge ${selectedLevel.track === "ic" ? "ic" : selectedLevel.track === "manager" ? "mgr" : "exec"} text-lg px-4 py-1`}
                >
                  {selectedLevel.code}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedLevel.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getTrackLabel(selectedLevel.track)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {selectedLevel.description}
              </p>
            </div>
            <button
              onClick={() => handleDownload(selectedLevel)}
              className="text-sm text-[#1A1A1A] hover:text-[#FF5B29] font-medium flex items-center gap-1 border border-[#1A1A1A] px-3 py-1.5 rounded-lg hover:bg-[#F5FF80]/20 transition-colors whitespace-nowrap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Requirements
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
              const dim =
                selectedLevel.dimensions[
                  key as keyof typeof selectedLevel.dimensions
                ];
              return (
                <div
                  key={key}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    {label}
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Criteria
                      </span>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {dim.criteria}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Expected Behaviors
                      </span>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {dim.expectedBehaviors}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
