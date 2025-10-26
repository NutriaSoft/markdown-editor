import { forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import remarkToc from "remark-toc";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeExternalLinks from "rehype-external-links";

import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

interface MarkdownPreviewProps {
  markdown: string;
  isExporting?: boolean;
  onExportPDF?: () => void;
  onlyView?: boolean;
}

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ markdown, isExporting = false, onExportPDF, onlyView = false }, ref) => {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Header de la Vista Previa */}
        {!onlyView && (
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
              {onExportPDF && (
                <button
                  onClick={onExportPDF}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
                  title="Descargar como PDF"
                >
                  {isExporting ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Descargar PDF</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contenido de la Vista Previa */}
        <div className="flex-1 overflow-auto bg-white">
          <div
            ref={ref}
            className="p-8 prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-800 prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:rounded"
          >
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
                remarkMath,
                remarkToc,
                remarkBreaks,
                remarkFrontmatter,
              ]}
              rehypePlugins={[
                rehypeKatex,
                rehypeSlug,
                rehypeAutolinkHeadings,
                rehypeHighlight,
                rehypeExternalLinks,
              ]}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }
);

MarkdownPreview.displayName = "MarkdownPreview";
