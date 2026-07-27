// Precompile prisma/seed.ts -> prisma/seed.cjs so the production runner image
// (which has no tsx) can seed a fresh database with plain `node`.
//
// esbuild is shipped as a dependency of tsx (a direct devDependency), so it is
// always installed, but pnpm does not hoist it to the top level. Resolve it
// from tsx's own location rather than assuming a top-level node_modules entry.
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const tsxDir = path.dirname(require.resolve('tsx'))
const esbuild = require(require.resolve('esbuild', { paths: [tsxDir] }))

await esbuild.build({
  entryPoints: ['prisma/seed.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  packages: 'external', // keep @prisma/client + node builtins as runtime require()
  outfile: 'prisma/seed.cjs',
})

console.log('✓ compiled prisma/seed.ts -> prisma/seed.cjs')
