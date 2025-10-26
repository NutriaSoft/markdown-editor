import { useState, useRef } from "react";
import { useEditorStore } from "./store/editorStore";
import { TabsBar } from "./TabsBar";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";

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
  const [isExporting, setIsExporting] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);

  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingFromEditor = useRef(false);
  const isScrollingFromPreview = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const handleExportPDF = async () => {
    if (!previewRef.current) return;

    try {
      setIsExporting(true);

      // Obtener todos los estilos CSS del documento
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch (e) {
            return "";
          }
        })
        .join("\n");

      // Crear HTML completo con estilos
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              ${styles}
            </style>
          </head>
          <body style="margin: 0; padding: 20px; background: white;">
            ${previewRef.current.outerHTML}
          </body>
        </html>
      `;

      // Enviar al servidor para generar PDF
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: htmlContent,
          title: activeTab?.title || "documento",
        }),
      });

      if (!response.ok) {
        throw new Error("Error al generar PDF");
      }

      // Descargar el PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab?.title || "documento"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!activeTab) return;

    try {
      // Crear un blob con el contenido markdown
      const blob = new Blob([markdown], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab.title || "documento"}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar Markdown:", error);
      alert(
        "Hubo un error al guardar el archivo. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleChangeMarkdown = (value: string) => {
    if (activeTab) {
      updateTabContent(activeTab.id, value);
    }
  };

  const handleEditorScroll = (scrollPercentage: number) => {
    if (
      !syncScroll ||
      !previewScrollRef.current ||
      isScrollingFromPreview.current
    )
      return;

    isScrollingFromEditor.current = true;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (previewScrollRef.current) {
        const previewScroll = previewScrollRef.current;
        const maxScroll =
          previewScroll.scrollHeight - previewScroll.clientHeight;
        const targetScroll = maxScroll * scrollPercentage;

        previewScroll.scrollTop = targetScroll;
      }

      // Liberar el flag inmediatamente después
      requestAnimationFrame(() => {
        isScrollingFromEditor.current = false;
      });
    });
  };

  const handlePreviewScroll = (scrollPercentage: number) => {
    if (!syncScroll || !editorRef.current || isScrollingFromEditor.current)
      return;

    isScrollingFromPreview.current = true;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (editorRef.current) {
        const editor = editorRef.current;
        const maxScroll = editor.scrollHeight - editor.clientHeight;
        const targetScroll = maxScroll * scrollPercentage;

        editor.scrollTop = targetScroll;
      }

      // Liberar el flag inmediatamente después
      requestAnimationFrame(() => {
        isScrollingFromPreview.current = false;
      });
    });
  };

  return (
    <div className="flex h-screen max-h-dvh bg-linear-to-br from-slate-50 to-slate-100">
      <div className="flex-1 flex flex-col h-full">
        {/* Tabs Bar */}
        <TabsBar
          tabs={tabs}
          activeTabId={activeTabId}
          onAddTab={addTab}
          onRemoveTab={removeTab}
          onSetActiveTab={setActiveTab}
          onUpdateTabTitle={updateTabTitle}
        />

        {/* Editor */}
        <MarkdownEditor
          ref={editorRef}
          markdown={markdown}
          onChangeMarkdown={handleChangeMarkdown}
          onScroll={handleEditorScroll}
        />
      </div>

      {/* Divisor con botón de sincronización */}
      <div className="relative w-1 bg-linear-to-b from-slate-300 via-slate-400 to-slate-300">
        <button
          onClick={() => setSyncScroll(!syncScroll)}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg transition-all ${
            syncScroll
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-slate-300 hover:bg-slate-400 text-slate-600"
          }`}
          title={
            syncScroll
              ? "Desactivar sincronización de scroll"
              : "Activar sincronización de scroll"
          }
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {syncScroll ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Panel de Vista Previa */}
      <MarkdownPreview
        ref={previewRef}
        scrollContainerRef={previewScrollRef}
        markdown={markdown}
        isExporting={isExporting}
        onExportPDF={handleExportPDF}
        onExportMarkdown={handleExportMarkdown}
        onScroll={handlePreviewScroll}
      />
    </div>
  );
}
