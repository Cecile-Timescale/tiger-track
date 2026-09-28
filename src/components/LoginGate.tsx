"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function TigerDataLogo({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 290 290"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_login"
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="290"
        height="290"
      >
        <path
          d="M289.56 144.779C289.56 64.8201 224.74 0 144.779 0C64.82 0 0 64.8201 0 144.779V145.142C0 225.101 64.82 289.922 144.779 289.922C224.74 289.922 289.56 225.101 289.56 145.142V144.779Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_login)">
        <path
          d="M126.099 130.478L126.085 106.588C126.085 105.167 125.522 103.801 124.516 102.796L103.861 82.0752L89.4512 97.9935L123.127 131.71C124.225 132.809 126.101 132.029 126.101 130.476L126.099 130.478Z"
          fill="#F5FF80"
        />
        <path
          d="M80.4705 188.078L39.8788 147.524L25.3721 163.301L79.069 217.014C80.1664 218.111 82.0406 217.334 82.0406 215.78V191.873C82.0406 190.448 81.4755 189.084 80.4705 188.078Z"
          fill="#F5FF80"
        />
        <path
          d="M134.544 0.880787C61.6887 5.91994 3.46441 66.2994 0.72089 139.365C-1.95687 210.707 47.0402 271.067 113.193 285.874L24.9994 197.559C23.7356 196.293 23.0266 194.575 23.0307 192.785L23.0965 164.254C23.0986 163.061 24.5392 162.465 25.3797 163.309L39.8864 147.531C38.9761 146.62 38.9761 145.14 39.8864 144.23L53.8403 130.292C54.7508 129.382 56.2242 129.384 57.1326 130.292L104.276 177.494C106.28 179.5 107.404 182.22 107.404 185.056V234.306C107.404 241.401 110.22 248.205 115.229 253.222L151.174 289.212C160.305 288.821 169.206 287.57 177.813 285.549L132.276 239.942C130.023 237.686 128.758 234.627 128.758 231.437V183.844C128.758 176.042 125.663 168.557 120.152 163.041L72.3031 115.133C71.3927 114.222 71.3926 112.742 72.3051 111.831L86.1625 97.9994C87.0729 97.0898 88.5464 97.0919 89.4548 98.0014L103.865 82.0834C103.596 81.7747 103.34 81.4374 103.086 81.0875C98.9714 75.5278 96.4707 66.359 99.387 56.0194C101.134 49.3999 104.761 44.4081 111.448 38.3422C112.036 37.8093 112.962 37.7825 113.561 38.301L130.881 53.3259L134.293 56.291C135.603 57.4289 137.169 58.2355 138.856 58.6367L192.858 71.4886C193.488 71.6368 194.068 71.9598 194.524 72.4043L249.993 127.808C250.961 128.737 251.511 130.031 251.511 131.377V143.156C251.511 144.967 251.056 146.751 250.185 148.337L222.734 198.413C221.538 200.605 218.86 201.523 216.575 200.526L203.922 195.004H157.679C154.707 195.004 152.302 197.416 152.302 200.389V221.033C152.302 223.875 153.423 226.604 155.422 228.62L203.318 276.942C253.758 254.459 288.935 203.807 288.935 144.93C288.935 61.7787 218.782 -4.95262 134.534 0.874612L134.544 0.880787Z"
          fill="#F5FF80"
        />
      </g>
    </svg>
  );
}

/**
 * Sign-in screen for Tiger Track.
 *
 * This used to be a plain text field that only checked the shape of
 * whatever email string the visitor typed — it never verified they
 * actually owned that address, so anyone could type any *@tigerdata.com
 * string and get in. It now hands off to real Google OAuth; the domain
 * check happens server-side in the signIn callback in src/auth.ts and
 * can't be spoofed from the browser.
 */
export default function LoginGate() {
  const searchParams = useSearchParams();
  const accessDenied = searchParams.get("error") === "AccessDenied";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #F5FF80 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow effect behind the card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, #F5FF80 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative">
              <TigerDataLogo size={80} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Tiger Track
          </h1>
          <p className="text-sm text-gray-400 mt-1.5 tracking-wide">
            Job Leveling by Tiger Data
          </p>
        </div>

        {/* Sign-in card */}
        <div className="bg-[#141414] rounded-2xl border border-[#2a2a2a] p-7 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Sign In</h2>
          <p className="text-sm text-gray-400 mb-6">
            Sign in with your Tiger Data Google account to continue.
          </p>

          {accessDenied && (
            <div className="mb-5 bg-red-950/40 border border-red-800/50 rounded-xl p-3">
              <p className="text-sm text-red-400">
                Access is restricted to Tiger Data team members. Please sign
                in with your @tigerdata.com Google account.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: "#F5FF80",
              color: "#0a0a0a",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e8f270";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(245, 255, 128, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F5FF80";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.5 0 10.4-2 14.1-5.3l-6.5-5.5C29.6 34.9 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.5C41.5 35.9 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-gray-500 text-center mt-5">
            Access restricted to{" "}
            <span className="text-[#F5FF80]/70">@tigerdata.com</span> team
            members.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Powered by Tiger Data
        </p>
      </div>
    </div>
  );
}
