import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useEditorStore } from "./store/editorStore";

export function MarkdownLatexPreviewer() {
  const {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    updateTabContent,
    updateTabTitle,
    setActiveTab,
    getActiveTab,
  } = useEditorStore();

  const activeTab = getActiveTab();
  const markdown = activeTab?.content || "";
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleTabDoubleClick = (tabId: string, currentTitle: string) => {
    setEditingTabId(tabId);
    setEditingTitle(currentTitle);
  };

  const handleTitleSave = () => {
    if (editingTabId && editingTitle.trim()) {
      updateTabTitle(editingTabId, editingTitle.trim());
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
    <div className="flex h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="flex-1 flex flex-col h-full">
        {/* Tabs Bar */}
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
                onClick={() => setActiveTab(tab.id)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
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
            onClick={addTab}
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

        {/* Header del Editor */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-slate-100 border-b border-slate-700">
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span className="font-semibold text-sm">Editor</span>
          <span className="ml-auto text-xs text-slate-400">
            {markdown.split("\n").length} líneas
          </span>
        </div>

        {/* Área del Editor con números de línea */}
        <div className="flex-1 flex overflow-hidden">
          {/* Números de línea */}
          <div className="bg-slate-800 text-slate-500 px-3 py-4 font-mono text-sm select-none overflow-hidden">
            {markdown.split("\n").map((_: string, i: number) => (
              <div key={i} className="text-right leading-6 h-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea del editor */}
          <textarea
            className="flex-1 p-4 font-mono text-sm resize-none bg-slate-900 text-slate-100 focus:outline-none leading-6 placeholder-slate-600"
            style={{
              caretColor: "#60a5fa",
              lineHeight: "1.5rem",
            }}
            value={markdown}
            onChange={(e) => {
              if (activeTab) {
                updateTabContent(activeTab.id, e.target.value);
              }
            }}
            placeholder="Escribe tu Markdown + LaTeX aquí..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Divisor */}
      <div className="w-1 bg-linear-to-b from-slate-300 via-slate-400 to-slate-300"></div>

      {/* Panel de Vista Previa */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header de la Vista Previa */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-200">
          <svg
            className="w-5 h-5 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="font-semibold text-sm text-slate-700">
            Vista Previa
          </span>
          <div className="ml-auto flex gap-2">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md font-medium">
              Live
            </span>
          </div>
        </div>

        {/* Contenido de la Vista Previa */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="p-8 prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-800 prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
