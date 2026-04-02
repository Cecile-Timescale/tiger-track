"use client";

import { useState } from "react";
import {
  LEVELS,
  DIMENSION_LABELS,
  getTrackLabel,
  getLevelsByTrack,
  type Level,
  type TrackType,
} from "@/lib/levelGuide";

const DIMENSION_KEYS = [
  "knowledgeExperience",
  "organizationalImpact",
  "innovationComplexity",
  "communicationInfluence",
  "leadershipTalentMgmt",
] as const;

type DimensionKey = (typeof DIMENSION_KEYS)[number];

export default function LevelCompare() {
  const [leftCode, setLeftCode] = useState<string>("");
  const [rightCode, setRightCode] = useState<string>("");
  const [activeDimension, setActiveDimension] = useState<DimensionKey>(
    "knowledgeExperience"
  );

  const leftLevel = LEVELS.find(
    (l) => l.code.toLowerCase() === leftCode.toLowerCase()
  );
  const rightLevel = LEVELS.find(
    (l) => l.code.toLowerCase() === rightCode.toLowerCase()
  );

  const trackGroups = [
    { label: "Individual Contributors", track: "ic" as TrackType },
    { label: "People Managers", track: "manager" as TrackType },
    { label: "Executives", track: "executive" as TrackType },
  ];

  const renderSelect = (
    value: string,
    onChange: (val: string) => void,
    label: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
      >
        <option value="">Select a level...</option>
        {trackGroups.map((group) => (
          <optgroup key={group.track} label={group.label}>
            {getLevelsByTrack(group.track).map((level) => (
              <option key={level.code} value={level.code}>
                {level.code} — {level.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );

  const getTrackClass = (level: Level) =>
    level.track === "ic" ? "ic" : level.track === "manager" ? "mgr" : "exec";

  const renderLevelCard = (level: Level | undefined, side: "left" | "right") => {
    if (!level) {
      return (
        <div className="flex-1 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-400">
            Select a level to compare
          </p>
        </div>
      );
    }

    const dim = level.dimensions[activeDimension];
    const trackClass = getTrackClass(level);

    return (
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Level header */}
        <div
          className={`px-4 py-3 border-b ${
            side === "left" ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`level-badge ${trackClass} text-lg px-3 py-0.5`}>
              {level.code}
            </span>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {level.title}
              </div>
              <div className="text-xs text-gray-500">
                {getTrackLabel(level.track)}
              </div>
            </div>
          </div>
        </div>

        {/* Dimension content */}
        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Criteria
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {dim.criteria}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Expected Behaviors
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {dim.expectedBehaviors}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Selection panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Compare Levels
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Select two levels to see a side-by-side comparison of what each
          requires across every dimension. Great for promotion conversations and
          calibration.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect(leftCode, setLeftCode, "Level A")}
          {renderSelect(rightCode, setRightCode, "Level B")}
        </div>
      </div>

      {/* Comparison view */}
      {(leftLevel || rightLevel) && (
        <>
          {/* Dimension tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 overflow-x-auto">
              <div className="flex">
                {DIMENSION_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveDimension(key)}
                    className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeDimension === key
                        ? "text-[#0a0a0a] border-[#0a0a0a] bg-gray-50"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {DIMENSION_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Side by side cards */}
            <div className="p-4">
              <div className="flex gap-4">
                {renderLevelCard(leftLevel, "left")}
                {renderLevelCard(rightLevel, "right")}
              </div>
            </div>
          </div>

          {/* Quick summary of what changes */}
          {leftLevel && rightLevel && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5">
              <h3 className="text-sm font-semibold text-indigo-900 mb-2">
                Key Differences: {leftLevel.code} vs {rightLevel.code}
              </h3>
              <div className="space-y-2">
                {DIMENSION_KEYS.map((key) => {
                  const leftDim = leftLevel.dimensions[key];
                  const rightDim = rightLevel.dimensions[key];
                  if (leftDim.criteria === rightDim.criteria) return null;
                  return (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-indigo-800">
                        {DIMENSION_LABELS[key]}:
                      </span>{" "}
                      <span className="text-indigo-700">
                        The {rightLevel.code} level requires{" "}
                        {rightLevel.level > leftLevel.level
                          ? "more advanced"
                          : "different"}{" "}
                        capabilities in this dimension.
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
