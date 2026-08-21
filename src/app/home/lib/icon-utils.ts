/**
 * Utility functions for handling platform/hub icons (URLs, Data URIs, and raw SVG code).
 */

/**
 * Checks if a string is raw SVG markup.
 */
export function isSvgMarkup(input: string): boolean {
  const trimmed = input.trim();
  return (
    trimmed.toLowerCase().startsWith("<svg") ||
    /^\s*<svg[\s>]/i.test(trimmed) ||
    (trimmed.includes("<svg") && trimmed.includes("</svg>"))
  );
}

/**
 * Ensures that root `<svg>` tag contains the required `xmlns="http://www.w3.org/2000/svg"` attribute
 * for standard browser `<img>` rendering.
 */
export function ensureSvgXmlns(svgStr: string): string {
  if (/xmlns\s*=/i.test(svgStr)) {
    return svgStr;
  }
  return svgStr.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
}

/**
 * Encodes a string to Base64 in a environment-agnostic way (Node.js & Browser).
 */
export function stringToBase64(str: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    try {
      return window.btoa(unescape(encodeURIComponent(str)));
    } catch {
      // Fallback if unescape fails
      return window.btoa(str);
    }
  }
  return Buffer.from(str, "utf-8").toString("base64");
}

/**
 * Converts raw SVG code into a Base64 Data URI.
 */
export function svgToDataUri(svgStr: string): string {
  const cleanSvg = ensureSvgXmlns(svgStr.trim());
  const base64 = stringToBase64(cleanSvg);
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Processes raw user icon input (URL or SVG code) into a safe, standard icon string for database storage.
 * - Raw SVG code is converted into a `data:image/svg+xml;base64,...` Data URI.
 * - URLs (http/https/data URI) are trimmed and returned as-is.
 * - Empty or whitespace-only inputs return `null`.
 */
export function processIconInput(input?: string | null): string | null {
  if (!input || !input.trim()) {
    return null;
  }

  const trimmed = input.trim();

  if (isSvgMarkup(trimmed)) {
    return svgToDataUri(trimmed);
  }

  return trimmed;
}

/**
 * Detects the type of icon provided for UI badge display.
 */
export function detectIconType(input?: string | null): "svg" | "url" | "none" {
  if (!input || !input.trim()) return "none";
  const trimmed = input.trim();
  if (isSvgMarkup(trimmed) || trimmed.startsWith("data:image/svg+xml")) {
    return "svg";
  }
  return "url";
}

/**
 * Gets a valid image src for `<img>` rendering from any stored icon string (URL, Data URI, or raw SVG).
 */
export function getIconSrc(input?: string | null): string | null {
  return processIconInput(input);
}
