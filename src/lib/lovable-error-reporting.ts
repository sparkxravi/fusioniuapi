export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  console.error("App error:", error, context);
}
