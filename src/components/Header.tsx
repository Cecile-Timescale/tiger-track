"use client";

export default function Header() {
  return (
    <header className="bg-[#1a365d] text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="flex items-center gap-3">
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="18" cy="18" r="16" fill="white" />
            <path
              d="M12 10 C12 10 18 8 24 10 C24 10 26 16 24 22 C24 22 18 26 12 22 C12 22 10 16 12 10Z"
              fill="#1a365d"
              stroke="#1a365d"
              strokeWidth="1.5"
            />
            <path
              d="M14 14 L18 12 L22 14 L18 24Z"
              fill="white"
              opacity="0.3"
            />
          </svg>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tiger Track</h1>
            <p className="text-xs text-blue-200">Job Leveling by Tiger Data</p>
          </div>
        </div>
      </div>
    </header>
  );
}
