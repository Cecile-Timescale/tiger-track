"use client";

type Tab = "level" | "lookup" | "assistant";

interface TabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "level", label: "Level a Role", icon: "📋" },
  { id: "lookup", label: "Level Requirements", icon: "🔍" },
  { id: "assistant", label: "AI Assistant", icon: "💬" },
];

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.id
              ? "bg-[#1A1A1A] text-[#F5FF80] shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
