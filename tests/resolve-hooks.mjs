// Test-only module resolution, so `node --test` can load the app's TypeScript as written.
// Node strips types natively but resolves imports strictly; the source relies on two things
// the bundler normally provides:
//   1. the `@/` alias (tsconfig `paths`), mapped here to the repo root;
//   2. extensionless imports ("./prng"), tried here as `.ts`.
// Only `.ts` is supported. `.tsx` needs a JSX transform, which is a component-test concern.
import { existsSync } from "node:fs"
import { registerHooks } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = new URL("../", import.meta.url)

function toUrl(specifier, parentURL) {
  if (specifier.startsWith("@/")) {
    return new URL(specifier.slice(2), root)
  }
  if (specifier.startsWith(".") && parentURL) {
    return new URL(specifier, parentURL)
  }
  return null
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    const fromApp = !context.parentURL?.includes("/node_modules/")
    const url = fromApp ? toUrl(specifier, context.parentURL) : null
    if (!url) {
      return nextResolve(specifier, context)
    }
    const path = fileURLToPath(url)
    const resolved = existsSync(path) ? path : `${path}.ts`
    return nextResolve(pathToFileURL(resolved).href, context)
  },
})
