import { BrowserExtension, Clipboard, Toast, environment, getFrontmostApplication, showToast } from "@raycast/api";
import { runAppleScript, usePromise } from "@raycast/utils";

/**
 * Custom hook to get the current URL from the active browser tab or clipboard.
 *
 * This hook attempts to retrieve the URL using the following methods in order:
 * 1. Browser Extension API (if available) - preferred method, works cross-platform
 * 2. AppleScript - fallback for supported browsers (macOS only)
 * 3. Clipboard - fallback for unsupported browsers (strict http/https validation)
 *
 * On Windows/Linux, the Browser Extension is required as AppleScript is not available.
 *
 * @returns {Promise<{url: string, source: 'browser' | 'clipboard'}>} Object containing the URL and its source
 * @throws {Error} If all methods fail or clipboard doesn't contain a valid URL
 */
export function useBrowserLink() {
  return usePromise(
    async () => {
      // Check if Browser Extension API is available
      if (environment.canAccess(BrowserExtension)) {
        try {
          const tabs = await BrowserExtension.getTabs();
          // Find the active tab
          const activeTab = tabs.find((tab) => tab.active);

          if (activeTab && activeTab.url) {
            return { url: activeTab.url, source: "browser" as const };
          }

          // If no active tab found, return the first tab's URL
          if (tabs.length > 0 && tabs[0].url) {
            return { url: tabs[0].url, source: "browser" as const };
          }

          throw new Error("No active tab found");
        } catch (error) {
          // Fallback to AppleScript if Browser Extension API fails
          console.warn("Browser Extension API failed:", error);
        }
      }

      // AppleScript fallback only works on macOS
      if (process.platform !== "darwin") {
        throw new Error("Please install the Raycast Browser Extension to use this feature on Windows/Linux");
      }

      // Fallback: AppleScript-based processing (macOS only)
      const app = await getFrontmostApplication();

      switch (app.bundleId) {
        case "company.thebrowser.Browser":
          return { url: await runAppleScript(`tell application "Arc" to return URL of active tab of front window`), source: "browser" as const };
        case "com.vivaldi.Vivaldi":
          return { url: await runAppleScript(`tell application "Vivaldi" to return URL of active tab of front window`), source: "browser" as const };
        case "com.google.Chrome":
          return { url: await runAppleScript(`tell application "Google Chrome" to return URL of active tab of front window`), source: "browser" as const };
        case "com.brave.Browser":
          return { url: await runAppleScript(`tell application "Brave Browser" to return URL of active tab of front window`), source: "browser" as const };
        case "com.apple.Safari":
          return { url: await runAppleScript(`tell application "Safari" to return URL of front document`), source: "browser" as const };
        case "com.kagi.kagimacOS":
          return { url: await runAppleScript(`tell application "Orion" to return URL of front document`), source: "browser" as const };
        case "org.mozilla.firefox":
          return { url: await runAppleScript(`
            tell application "System Events"
              set firefox to application process "Firefox"

              -- HACK: It is important to get the list of UI elements; otherwise, we get an error
              get properties of firefox

              set frontWindow to front window of firefox
              set firstGroup to first group of frontWindow
              set navigation to toolbar "Navigation" of firstGroup
              get value of UI element 1 of combo box 1 of navigation
            end tell
          `), source: "browser" as const };
        case "app.zen-browser.zen":
          return { url: await runAppleScript(`
            tell application "System Events"
                set zen to application process "Zen"

                get properties of zen

                set frontWindow to front window of zen
                set firstGroup to first group of frontWindow
                set navigation to toolbar "Navigation" of group 1 of group 1 of firstGroup
                get value of UI element 1 of combo box 1 of group 1 of navigation
            end tell
          `), source: "browser" as const };
        case "net.imput.helium":
          return { url: await runAppleScript(`tell application "Helium" to return URL of active tab of front window`), source: "browser" as const };
        case "company.thebrowser.dia":
          return { url: await runAppleScript(`
            tell application "Dia"
              return URL of (first tab of front window whose isFocused is true)
            end tell`), source: "browser" as const };
        default:
          break;
      }

      // Fallback for Vivaldi Browser not recognized by bundleId
      if (app?.name === "Vivaldi.app") {
        return { url: await runAppleScript(`tell application "Vivaldi" to return URL of active tab of front window`), source: "browser" as const };
      }

      // Fallback for Helium Browser not recognized by bundleId
      if (app?.name === "Helium.app") {
        return { url: await runAppleScript(`tell application "Helium" to return URL of active tab of front window`), source: "browser" as const };
      }

      // Before throwing error, try clipboard as fallback
      console.warn(`Unsupported browser - Bundle ID: ${app.bundleId}, Name: ${app.name}`);
      console.log("Attempting clipboard fallback...");

      try {
        const clipboardText = await Clipboard.readText();

        if (!clipboardText || clipboardText.trim() === "") {
          throw new Error(`Unsupported App: ${app.name}. Clipboard is empty.`);
        }

        // Strict URL validation (http/https only)
        const trimmedText = clipboardText.trim();
        const url = new URL(trimmedText);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error(`Unsupported App: ${app.name}. Clipboard contains invalid URL (must be http/https).`);
        }

        return { url: trimmedText, source: "clipboard" as const };
      } catch (clipboardError) {
        // If clipboard also fails, throw combined error
        if (clipboardError instanceof TypeError) {
          // URL constructor throws TypeError for invalid URLs
          throw new Error(`Unsupported App: ${app.name}. Clipboard does not contain a valid URL.`);
        }
        throw clipboardError;
      }
    },
    [],
    {
      onError: (error) => {
        showToast(Toast.Style.Failure, error.message);
      },
    },
  );
}
