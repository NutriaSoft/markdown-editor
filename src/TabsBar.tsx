import { useState } from "react";
import type { Tab } from "./store/editorStore";

interface TabsBarProps {
  tabs: Tab[];
  activeTabId: string;
  onAddTab: () => void;
  onRemoveTab: (id: string) => void;
  onSetActiveTab: (id: string) => void;
  onUpdateTabTitle: (id: string, title: string) => void;
}

export function TabsBar({
  tabs,
  activeTabId,
  onAddTab,
  onRemoveTab,
  onSetActiveTab,
  onUpdateTabTitle,
}: TabsBarProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleTabDoubleClick = (tabId: string, currentTitle: string) => {
    setEditingTabId(tabId);
    setEditingTitle(currentTitle);
  };

  const handleTitleSave = () => {
    if (editingTabId && editingTitle.trim()) {
      onUpdateTabTitle(editingTabId, editingTitle.trim());
    }
    setEditingTabId(null);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setEditingTabId(null);
    }
  };

  return (
    <div className="flex items-center bg-slate-700 border-b border-slate-600 overflow-x-auto">
      <div className="flex items-center flex-1 min-w-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-slate-600 min-w-0 transition-colors ${
              activeTabId === tab.id
                ? "bg-slate-800 text-slate-100"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
            onClick={() => onSetActiveTab(tab.id)}
          >
            {editingTabId === tab.id ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="bg-slate-900 text-slate-100 px-2 py-0.5 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-0 w-32"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-sm font-medium truncate"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleTabDoubleClick(tab.id, tab.title);
                }}
                title={tab.title}
              >
                {tab.title}
              </span>
            )}
            {tabs.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-slate-500 rounded p-0.5 transition-opacity"
                title="Cerrar tab"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAddTab}
        className="px-3 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-600 transition-colors shrink-0"
        title="Nuevo documento"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}
