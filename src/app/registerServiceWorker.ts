const isServiceWorkerSupported =
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  window.location.protocol !== "file:"

export function registerServiceWorker() {
  if (!isServiceWorkerSupported) {
    return
  }

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("./sw.js").catch((error: unknown) => {
      console.error("[PWA] Service worker 注册失败", error)
    })
  })
}
