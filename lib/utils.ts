import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");
  sanitized = sanitized.replace(/javascript:/gi, "");
  return sanitized;
}

export function containsBlockedWord(text: string, blockedWords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return blockedWords.some(word => {
    const pattern = new RegExp(`\\b${word.toLowerCase()}\\b`, "i");
    return pattern.test(lowerText);
  });
}

