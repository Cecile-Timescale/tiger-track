"use client";

import { useState } from "react";

interface ExportBarProps {
  onCopy: () => Promise<boolean>;
  onCopyAll?: () => Promise<boolean>;
  onExportPDF: () => void;
  copyLabel?: string;
  copyAllLabel?: string;
}

export default function ExportBar({
  onCopy,
  onCopyAll,
  onExportPDF,
  copyLabel = "Copy",
  copyAllLabel = "Copy All",
}: ExportBarProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (which: string, fn: () => Promise<boolean>) => {
    const ok = await fn();
    if (ok) {
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => handleCopy("copy", onCopy)}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
      >
        {copied === "copy" ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Copied!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            {copyLabel}
          </>
        )}
      </button>

      {onCopyAll && (
        <button
          onClick={() => handleCopy("all", onCopyAll)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {copied === "all" ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              {copyAllLabel}
            </>
          )}
        </button>
      )}

      <button
        onClick={onExportPDF}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-[#F5FF80] hover:bg-[#2A2A2A] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export PDF
      </button>
    </div>
  );
}
