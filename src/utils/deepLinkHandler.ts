// Global handler for unicity-connect:// deep links
// Separated from markdown.tsx to satisfy react-refresh/only-export-components rule

export type DeepLinkClickHandler = (httpsUrl: string) => void;

let globalDeepLinkClickHandler: DeepLinkClickHandler | null = null;

export function setDeepLinkClickHandler(handler: DeepLinkClickHandler | null) {
  globalDeepLinkClickHandler = handler;
}

export function getDeepLinkClickHandler(): DeepLinkClickHandler | null {
  return globalDeepLinkClickHandler;
}

/** Convert unicity-connect://host/path to https://host/path */
export function deepLinkToHttps(deepLink: string): string {
  return deepLink.replace(/^unicity-connect:\/\//, 'https://');
}
