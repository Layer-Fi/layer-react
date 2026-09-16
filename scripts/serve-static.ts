import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

export const STATIC_ROOT = 'storybook-static'

// Above the 6006 dev server so a running `npm run storybook` doesn't collide.
const STORYBOOK_PORT = 6007

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
}

export function serveStatic(root: string, port: number) {
  const resolvedRoot = path.resolve(root)

  const server = http.createServer((req, res) => {
    let file: string
    try {
      const requested = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
      file = path.join(resolvedRoot, requested === '/' ? 'index.html' : requested)
    }
    catch {
      // Malformed percent-encoding throws, which would take the server down mid-run.
      res.writeHead(400).end()
      return
    }

    // `path.relative` rather than a prefix test: `/tmp/root2` starts with `/tmp/root`.
    const relative = path.relative(resolvedRoot, file)
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file)) {
      res.writeHead(404).end()
      return
    }

    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream',
      'Service-Worker-Allowed': '/',
    })
    fs.createReadStream(file).pipe(res)
  })

  return new Promise<{ server: http.Server, origin: string }>(resolve =>
    server.listen(port, () => resolve({ server, origin: `http://localhost:${port}` })),
  )
}

/**
 * Serves the static build over http. Needed because MSW's service worker won't register on
 * `file://`, and every story's data comes from MSW.
 */
export function serveStorybookStatic() {
  return serveStatic(STATIC_ROOT, STORYBOOK_PORT)
}

export function requireStorybookBuild(file: string) {
  if (fs.existsSync(file)) return
  console.error(`${file} not found. Run \`npm run storybook:build\` first.`)
  process.exit(1)
}
