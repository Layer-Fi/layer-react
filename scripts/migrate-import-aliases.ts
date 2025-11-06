import { Project, SyntaxKind } from 'ts-morph'
import fg from 'fast-glob'
import path from 'node:path'
import fs from 'node:fs'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')

// add near the top
const SKIP_EXT = /\.(s?css|less|sass|styl|svg|png|jpg|jpeg|gif)$/i;


/**
 * Map absolute directory prefixes -> alias prefix
 * Order matters: more specific first (e.g., @ui before @components).
 */
const ALIAS_MAP: Array<{ abs: string, alias: string }> = [
  { abs: path.join(SRC, 'components', 'ui'), alias: '@ui' },
  { abs: path.join(SRC, 'components'), alias: '@components' },
  { abs: path.join(SRC, 'api'), alias: '@api' },
  { abs: path.join(SRC, 'contexts'), alias: '@contexts' },
  { abs: path.join(SRC, 'providers'), alias: '@providers' },
  { abs: path.join(SRC, 'hooks'), alias: '@hooks' },
  { abs: path.join(SRC, 'utils'), alias: '@utils' },
  { abs: path.join(SRC, 'schemas'), alias: '@schemas' },
  { abs: path.join(SRC, 'views'), alias: '@views' },
  { abs: path.join(SRC, 'config'), alias: '@config' },
  { abs: path.join(SRC, 'icons'), alias: '@icons' },
  { abs: path.join(SRC, 'features'), alias: '@features' },
  { abs: path.join(SRC, 'types'), alias: '@internal-types' },
  { abs: path.join(SRC, 'assets'), alias: '@assets' },
]

const isRelative = (s: string) => s.startsWith('./') || s.startsWith('../')

function toAlias(fromFile: string, spec: string): string | null {
  if (!isRelative(spec)) return null
  const resolved = path.resolve(path.dirname(fromFile), spec)
  // If it points to a file, strip extension; if directory, leave as is
  let p = resolved
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    const withoutExt = resolved.replace(/\.[^.]+$/, '')
    p = withoutExt
  }
  // Try to match to an alias base
  for (const { abs, alias } of ALIAS_MAP) {
    if (p === abs || p.startsWith(abs + path.sep)) {
      const remainder = p.slice(abs.length).replace(new RegExp('\\' + path.sep, 'g'), '/')
      const cleaned = remainder.replace(/^\/+/, '')
      return cleaned ? `${alias}/${cleaned}` : alias
    }
  }
  return null
}

async function main() {
  const files = await fg(['src/**/*.{ts,tsx,js,jsx}'], { dot: false })
  const project = new Project({
    tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })
  project.addSourceFilesAtPaths(files)

  let changed = 0
  for (const sf of project.getSourceFiles()) {
    let did = false
    sf.forEachChild((node) => {
      if (node.getKind() === SyntaxKind.ImportDeclaration) {
        const id = node.asKindOrThrow(SyntaxKind.ImportDeclaration);
        const lit = id.getModuleSpecifier();
        const text = lit.getLiteralText();

        // 1) skip styles & assets completely
        if (SKIP_EXT.test(text)) return;

        // 2) (optional) also skip pure side-effect imports:
        // if (id.getNamedImports().length === 0 && !id.getDefaultImport()) return;

        const alias = toAlias(sf.getFilePath(), text);
        if (alias && alias !== text) {
          lit.setLiteralValue(alias);
          did = true;
        }
      }
    });
    if (did) {
      changed++
    }
  }

  const result = await project.save()
  console.log(`Updated ${changed} files. Done.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
