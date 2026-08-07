import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a prefixed unique ID.
 * @param {string} prefix - The category prefix (e.g., 'user', 'ride').
 * @param {number} [length=10] - Optional custom length for the ID part.
 * @returns {string} The formatted ID string.
 */
export const generateUniqueId = (prefix: string, length: number = 10): string => {
  return `${prefix}-${nanoid(length)}`;
};

