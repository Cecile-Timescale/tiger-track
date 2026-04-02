"use client";

interface HeaderProps {
  userEmail?: string;
  onSignOut?: () => void;
}

export default function Header({ userEmail, onSignOut }: HeaderProps) {
  // Extract first name from email for display
  const displayName = userEmail
    ? userEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <header className="bg-[#1a365d] text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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

        {userEmail && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-300 bg-opacity-30 flex items-center justify-center text-sm font-semibold">
                {displayName?.[0] || "?"}
              </div>
              <span className="text-sm text-blue-100 hidden sm:inline">
                {displayName}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="text-xs text-blue-200 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
