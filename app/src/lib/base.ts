// Deploy prefix, e.g. "/momo" on GitHub Pages project sites. Empty when served from the domain root.
// Next adds it to <Link>/router URLs itself; plain asset URLs (manifest, SW, notification icons) use this.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
