// Only same-origin paths are safe after sign-in. "//host" and "/\host" are not: browsers read them as another origin.
export function safeNext(
  value: string | string[] | null | undefined,
  fallback = "/today"
): string {
  const next = Array.isArray(value) ? value[0] : value
  if (
    !next?.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\") ||
    // biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are what this rejects
    /[\u0000-\u001f]/.test(next) ||
    next.startsWith("/sign-in")
  )
    return fallback
  return next
}
