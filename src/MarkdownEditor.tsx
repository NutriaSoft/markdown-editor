import { forwardRef } from "react";

interface MarkdownEditorProps {
  markdown: string;
  onChangeMarkdown: (value: string) => void;
  onScroll?: (scrollPercentage: number) => void;
}

export const MarkdownEditor = forwardRef<
  HTMLTextAreaElement,
  MarkdownEditorProps
>(({ markdown, onChangeMarkdown, onScroll }, ref) => {
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (onScroll) {
      const target = e.currentTarget;
      const scrollPercentage =
        target.scrollTop / (target.scrollHeight - target.clientHeight);
      onScroll(scrollPercentage);
    }
  };
  return (
    <div className="flex-1 flex flex-col h-full">
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
          ref={ref}
          className="flex-1 p-4 font-mono text-sm resize-none bg-slate-900 text-slate-100 focus:outline-none leading-6 placeholder-slate-600"
          style={{
            caretColor: "#60a5fa",
            lineHeight: "1.5rem",
          }}
          value={markdown}
          onChange={(e) => onChangeMarkdown(e.target.value)}
          onScroll={handleScroll}
          placeholder="Escribe tu Markdown + LaTeX aquí..."
          spellCheck={false}
        />
      </div>
    </div>
  );
});

MarkdownEditor.displayName = "MarkdownEditor";
