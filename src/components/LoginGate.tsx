"use client";

import { useState } from "react";

interface LoginGateProps {
  onAuthenticated: (email: string) => void;
}

export default function LoginGate({ onAuthenticated }: LoginGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    // Check for @tigerdata.com domain
    if (!trimmedEmail.endsWith("@tigerdata.com")) {
      setError(
        "Access is restricted to Tiger Data team members. Please use your @tigerdata.com email address."
      );
      setIsLoading(false);
      return;
    }

    // Store in sessionStorage (cleared when browser/tab closes)
    sessionStorage.setItem("tiger_track_user", trimmedEmail);
    setIsLoading(false);
    onAuthenticated(trimmedEmail);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg
              width="56"
              height="56"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="18" cy="18" r="16" fill="#1a365d" />
              <path
                d="M12 10 C12 10 18 8 24 10 C24 10 26 16 24 22 C24 22 18 26 12 22 C12 22 10 16 12 10Z"
                fill="white"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M14 14 L18 12 L22 14 L18 24Z"
                fill="#1a365d"
                opacity="0.3"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tiger Track</h1>
          <p className="text-sm text-gray-500 mt-1">
            Job Leveling by Tiger Data
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign In</h2>
          <p className="text-sm text-gray-500 mb-5">
            Enter your Tiger Data email to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="you@tigerdata.com"
                autoFocus
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!email.trim() || isLoading}
              className="w-full bg-[#1a365d] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#2a4a7f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            Access is restricted to @tigerdata.com email addresses.
          </p>
        </div>
      </div>
    </div>
  );
}
