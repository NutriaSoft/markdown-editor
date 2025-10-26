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
  const previewRef = useRef<HTMLDivElement>(null);

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

  const handleChangeMarkdown = (value: string) => {
    if (activeTab) {
      updateTabContent(activeTab.id, value);
    }
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
          markdown={markdown}
          onChangeMarkdown={handleChangeMarkdown}
        />
      </div>

      {/* Divisor */}
      <div className="w-1 bg-linear-to-b from-slate-300 via-slate-400 to-slate-300"></div>

      {/* Panel de Vista Previa */}
      <MarkdownPreview
        ref={previewRef}
        markdown={markdown}
        isExporting={isExporting}
        onExportPDF={handleExportPDF}
      />
    </div>
  );
}
