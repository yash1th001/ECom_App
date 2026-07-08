import { Platform } from "react-native";

export const crashReporter = {
  init() {
    console.log(`[CrashReporter] Initialized crash reporting for platform: ${Platform.OS}`);
  },
  captureException(error: Error, context?: string) {
    console.error(`[CrashReporter] Captured Exception:`, error, `Context:`, context ?? "None");
    // In production, this would send the error to Sentry or another crash reporting backend
  },
  captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
    console.log(`[CrashReporter] Logged Message [${level}]:`, message);
  }
};
