import { serve } from "bun";
import index from "./index.html";
import { chromium } from "playwright";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/generate-pdf": {
      async POST(req) {
        try {
          const { html, title } = await req.json();

          // Lanzar navegador headless
          const browser = await chromium.launch({
            headless: true,
          });

          const page = await browser.newPage();

          // Establecer el contenido HTML
          await page.setContent(html, {
            waitUntil: "networkidle",
          });

          // Esperar a que se cargue MathJax/KaTeX si está presente
          await page.waitForTimeout(1000);

          // Generar PDF
          const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
              top: "10mm",
              right: "10mm",
              bottom: "10mm",
              left: "10mm",
            },
          });

          await browser.close();

          // Devolver el PDF
          return new Response(Buffer.from(pdfBuffer), {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${title || "documento"}.pdf"`,
            },
          });
        } catch (error) {
          console.error("Error generando PDF:", error);
          return Response.json(
            { error: "Error al generar PDF" },
            { status: 500 }
          );
        }
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
