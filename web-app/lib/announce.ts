// Writes into the polite live region in the app shell. Used for route changes and booking results.
export function announce(message: string) {
  if (typeof document === "undefined") return
  const el = document.getElementById("live-status")
  if (!el) return
  el.textContent = ""
  window.setTimeout(() => {
    el.textContent = message
  }, 30)
}
