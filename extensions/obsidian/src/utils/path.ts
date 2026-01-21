import { homedir } from "os";
import path from "path";

/**
 * Expands tilde (~) in file paths to the user's home directory.
 * Enables cross-device compatibility where usernames differ but
 * relative path structure remains the same (e.g., iCloud paths).
 *
 * @example expandTildePath("~/Documents/Notes") => "/Users/username/Documents/Notes"
 */
export function expandTildePath(filePath: string): string {
  if (!filePath) {
    return filePath;
  }

  const trimmedPath = filePath.trim();

  if (trimmedPath.startsWith("~/") || trimmedPath === "~") {
    return path.join(homedir(), trimmedPath.slice(1));
  }

  return trimmedPath;
}
