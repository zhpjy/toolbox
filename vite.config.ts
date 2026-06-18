import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

function inlineBuildAssets() {
  return {
    name: "inline-build-assets",
    enforce: "post" as const,
    generateBundle(_options: unknown, bundle: Record<string, { type: string; fileName: string; source?: string | Uint8Array; code?: string }>) {
      const htmlAsset = Object.values(bundle).find(
        (item) => item.type === "asset" && item.fileName.endsWith(".html")
      )

      if (!htmlAsset || typeof htmlAsset.source !== "string") {
        return
      }

      let html = htmlAsset.source

      for (const item of Object.values(bundle)) {
        if (item.fileName.endsWith(".js") && item.code) {
          const scriptTagPattern = new RegExp(
            `<script\\s+type="module"\\s+crossorigin\\s+src="(?:\\.?/)?${item.fileName.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}"></script>`
          )
          if (scriptTagPattern.test(html)) {
            html = html.replace(scriptTagPattern, () => `<script type="module">${item.code}</script>`)
            delete bundle[item.fileName]
          }
        }

        if (item.fileName.endsWith(".css") && typeof item.source === "string") {
          const styleTagPattern = new RegExp(
            `<link\\s+rel="stylesheet"\\s+crossorigin\\s+href="(?:\\.?/)?${item.fileName.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}">`
          )
          if (styleTagPattern.test(html)) {
            html = html.replace(styleTagPattern, () => `<style>${item.source}</style>`)
            delete bundle[item.fileName]
          }
        }
      }

      html = html.replace(/<link rel="modulepreload"[^>]*>/g, "")
      htmlAsset.source = html
    }
  }
}

export default defineConfig({
  base: "./",
  plugins: [react(), inlineBuildAssets()],
  build: {
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    modulePreload: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
