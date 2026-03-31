"use client";

export default function Header() {
  return (
    <header className="bg-[#1A1A1A] text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="flex items-center gap-3">
          <svg
            width="40"
            height="40"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="48" fill="#F5FF80" />
            <path
              d="M30 35 C30 35 38 20 55 22 C55 22 72 24 75 40 C75 40 77 55 68 65 C68 65 55 78 38 72 C38 72 25 65 30 35Z"
              fill="#1A1A1A"
            />
            <path
              d="M42 38 L55 32 L65 42 L58 62 L42 58Z"
              fill="#F5FF80"
              opacity="0.25"
            />
            <path
              d="M35 42 C35 42 40 38 48 40"
              stroke="#F5FF80"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M33 48 C33 48 38 44 46 46"
              stroke="#F5FF80"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M32 54 C32 54 37 50 45 52"
              stroke="#F5FF80"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tiger Track</h1>
            <p className="text-xs text-[#F5FF80] opacity-80">Job Leveling by Tiger Data</p>
          </div>
        </div>
      </div>
    </header>
  );
}
