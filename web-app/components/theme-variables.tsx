import { previewCssVariables } from "@/components/graphical/lib/theme-model"
import { appTheme } from "@/lib/app-theme"

type Variables = Record<string, string | number | undefined>

const declarations = (variables: Variables) =>
  Object.entries(variables)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name}:${value}`)
    .join(";")

// GraphicalProvider writes the theme variables as inline styles on its wrapper, and only after the client knows the
// color mode. Pages are static, so the server cannot know the mode. This emits the same variables, produced by the
// same function from the same document, at :root (light) and :root.dark (dark). The class comes from next-themes'
// blocking script, so the first paint has the right colors, and <body>, shadcn variables and portals can read them.
// The CSS is generated on render. No token value is written here.
export function ThemeVariables() {
  const light = declarations(
    previewCssVariables(appTheme.theme, "light") as Variables
  )
  const dark = declarations(
    previewCssVariables(appTheme.theme, "dark") as Variables
  )
  // The Graphical wrapper also writes these as inline styles, using "light" until the client mounts. That would flash
  // light colours on a dark device, so the same values are restated with !important for the wrapper by mode.
  const imp = (d: string) =>
    d
      .split(";")
      .map((x) => `${x} !important`)
      .join(";")
  return (
    <style
      id="graphical-theme-variables"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: CSS variables built from our own theme tokens, no user input
      dangerouslySetInnerHTML={{
        __html: `:root{${light}}:root.dark{${dark}}:root:not(.dark) .graphical-theme{${imp(light)}}:root.dark .graphical-theme{${imp(dark)}}`,
      }}
    />
  )
}
