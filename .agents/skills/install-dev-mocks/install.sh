#!/usr/bin/env bash
# Install / uninstall the dev-only mock-registry infrastructure in a
# layer-react checkout, keeping the changes out of `git status`.
#
# Usage:
#   install.sh install   [--path <dir>]
#   install.sh uninstall [--path <dir>]
#   install.sh status    [--path <dir>]
set -euo pipefail

MODE="${1:-install}"
shift || true

TARGET=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --path)
      TARGET="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

TARGET="${TARGET:-$PWD}"
TARGET="$(cd "$TARGET" && pwd)"

AUTH_HTTP="$TARGET/src/utils/api/authenticatedHttp.ts"
INDEX_TSX="$TARGET/src/index.tsx"
VITE_CFG="$TARGET/vite/vite.config.ts"
VITE_DTS="$TARGET/src/types/vite.d.ts"
MOCK_REG="$TARGET/src/utils/api/mockRegistry.ts"
MOCKS_DIR="$TARGET/src/mocks"
GIT_EXCLUDE="$TARGET/.git/info/exclude"

# Trailing sentinel marker for the import line — survives auto-sort because it
# stays attached to the import statement itself.
IMPORT_LINE="import { findMockResponse } from '@utils/api/mockRegistry' // install-dev-mocks:import"

# --- Markers keep edits locatable for reversal --------------------------------
BEGIN_INTERCEPT="        // <<< install-dev-mocks:intercept"
END_INTERCEPT="        // install-dev-mocks:intercept >>>"
BEGIN_LOADER="// <<< install-dev-mocks:loader"
END_LOADER="// install-dev-mocks:loader >>>"
BEGIN_DEFINE="    // <<< install-dev-mocks:define"
END_DEFINE="    // install-dev-mocks:define >>>"

EXCLUDE_PATHS=(
  "src/types/vite.d.ts"
  "src/utils/api/mockRegistry.ts"
  "src/mocks/"
)

# ----------------------------------------------------------------------------
require_layer_react() {
  if [[ ! -f "$AUTH_HTTP" || ! -f "$INDEX_TSX" ]]; then
    echo "error: $TARGET does not look like a layer-react checkout" >&2
    echo "  missing: $AUTH_HTTP or $INDEX_TSX" >&2
    exit 1
  fi
  if [[ ! -d "$TARGET/.git" ]]; then
    echo "error: $TARGET is not a git repo" >&2
    exit 1
  fi
}

write_vite_dts() {
  mkdir -p "$(dirname "$VITE_DTS")"
  cat >"$VITE_DTS" <<'EOF'
interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
EOF
}

write_mock_registry() {
  mkdir -p "$(dirname "$MOCK_REG")"
  cat >"$MOCK_REG" <<'EOF'
type MockResponse = Record<string, unknown>
type MockEntry = {
  match: (url: string) => boolean
  response: () => MockResponse
}

const mocks: MockEntry[] = []

export function registerMock(match: MockEntry['match'], response: MockEntry['response']) {
  if (!import.meta.env.DEV) {
    return
  }
  mocks.push({ match, response })
}

export function findMockResponse(url: string): MockResponse | undefined {
  if (!import.meta.env.DEV) {
    return undefined
  }
  return mocks.find(entry => entry.match(url))?.response()
}
EOF
}

scaffold_mocks_dir() {
  mkdir -p "$MOCKS_DIR"
  if [[ ! -f "$MOCKS_DIR/README.md" ]]; then
    cat >"$MOCKS_DIR/README.md" <<'EOF'
Dev-only mock payloads. Add one file per feature, e.g.:

    import { registerMock } from '@utils/api/mockRegistry'

    registerMock(
      url => url.includes('/tax-estimates/summary'),
      () => ({ data: { /* raw API shape, snake_case, ISO date strings */ } }),
    )

Then register it for loading in src/index.tsx:

    if (import.meta.env.DEV) {
      void import('./mocks/<feature>')
    }

Mocks must be in raw API shape — the Effect Schema decode runs over them.
EOF
  fi
}

# Python-based in-place editor — avoids sed's cross-platform quirks.
patch_file() {
  local file="$1"
  local action="$2"   # inject | revert
  local begin="$3"
  local end="$4"
  local payload="${5:-}"   # inject: text to insert (may be empty); revert: ignored
  local anchor="${6:-}"    # inject: insert AFTER this exact line (optional); appends to EOF if empty

  python3 - "$file" "$action" "$begin" "$end" "$payload" "$anchor" <<'PY'
import sys, io, os
path, action, begin, end, payload, anchor = sys.argv[1:7]
with open(path, 'r', encoding='utf-8') as fh:
    src = fh.read()

def strip_block(text):
    b = text.find(begin)
    if b == -1:
        return text, False
    e = text.find(end, b)
    if e == -1:
        raise SystemExit(f"error: found begin marker but no end marker in {path}")
    e_end = text.find('\n', e)
    e_end = len(text) if e_end == -1 else e_end + 1
    b_start = text.rfind('\n', 0, b)
    b_start = 0 if b_start == -1 else b_start + 1
    before = text[:b_start]
    after = text[e_end:]
    # Collapse blank-line pile-up at the splice. If the original file already
    # had a blank line adjacent to the inserted block, strip leaves two blanks.
    while before.endswith('\n\n') and after.startswith('\n'):
        after = after[1:]
    return before + after, True

if action == 'revert':
    new, removed = strip_block(src)
    if removed:
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(new)
    sys.exit(0)

# inject: bail if already present
if begin in src:
    sys.exit(0)

block = f"{begin}\n{payload}\n{end}\n"

if anchor:
    idx = src.find(anchor)
    if idx == -1:
        raise SystemExit(f"error: anchor not found in {path}:\n  {anchor!r}")
    line_end = src.find('\n', idx)
    if line_end == -1:
        line_end = len(src)
    new = src[:line_end+1] + block + src[line_end+1:]
else:
    sep = '' if src.endswith('\n') else '\n'
    new = src + sep + block

with open(path, 'w', encoding='utf-8') as fh:
    fh.write(new)
PY
}

patch_auth_http_inject() {
  # Add the import as a self-tagged line. An inline trailing comment survives
  # eslint import/order auto-fix (which would scramble wrapper markers).
  python3 - "$AUTH_HTTP" "$IMPORT_LINE" <<'PY'
import sys
path, line = sys.argv[1], sys.argv[2]
with open(path, 'r', encoding='utf-8') as fh:
    src = fh.read()
if "install-dev-mocks:import" in src:
    sys.exit(0)
# Insert after the first existing top-level import block.
anchor = "import { APIError, type APIErrorMessage } from '@utils/api/apiError'"
idx = src.find(anchor)
if idx == -1:
    raise SystemExit(f"error: anchor import not found in {path}")
eol = src.find('\n', idx)
eol = len(src) if eol == -1 else eol + 1
src = src[:eol] + line + "\n" + src[eol:]
with open(path, 'w', encoding='utf-8') as fh:
    fh.write(src)
PY

  # The get() thunk is an expression-body arrow (`(): Promise<Return> =>\n fetch(...)`).
  # Inserting an if-statement before `fetch(...)` is a syntax error, so we
  # rewrite the thunk wholesale to a block body with the mock check + `return`.
  python3 - "$AUTH_HTTP" "$BEGIN_INTERCEPT" "$END_INTERCEPT" <<'PY'
import sys, re
path, begin, end = sys.argv[1:4]
with open(path, 'r', encoding='utf-8') as fh:
    src = fh.read()

if begin in src:
    sys.exit(0)   # already patched

before = (
    "      (): Promise<Return> =>\n"
    "        fetch(`${baseUrl}${url(options?.params || ({} as Params))}`, {\n"
)
after = (
    "      (): Promise<Return> => {\n"
    "        " + begin + "\n"
    "        if (import.meta.env.DEV) {\n"
    "          const mocked = findMockResponse(`${baseUrl}${url(options?.params || ({} as Params))}`)\n"
    "          if (mocked !== undefined) return Promise.resolve(mocked as Return)\n"
    "        }\n"
    "        " + end + "\n"
    "        return fetch(`${baseUrl}${url(options?.params || ({} as Params))}`, {\n"
)
if before not in src:
    raise SystemExit(f"error: expected thunk header not found in {path} — upstream changed")
src = src.replace(before, after, 1)

# Close the block: the thunk used to end with `.catch(...)` at indent 10. Add a closing `}`
# on the line after that catch, at the thunk's indent (6 spaces).
tail_before = "          .catch((error: Error | APIError) => handleException(error))\n"
# We need to close only the FIRST arrow's body (get), not getText — they share this tail.
# Locate the first occurrence after our patched section and append `      }\n` after it.
idx = src.find(tail_before)
if idx == -1:
    raise SystemExit("error: expected thunk tail not found — upstream changed")
insert_at = idx + len(tail_before)
src = src[:insert_at] + "      }\n" + src[insert_at:]

with open(path, 'w', encoding='utf-8') as fh:
    fh.write(src)
PY
}

patch_index_tsx_inject() {
  patch_file "$INDEX_TSX" inject \
    "$BEGIN_LOADER" "$END_LOADER" \
    "if (import.meta.env.DEV) {
  // Add mock loaders here: void import('./mocks/<feature>')
}" \
    ""   # no anchor → append to EOF
}

# Vite replaces `import.meta.env.DEV` to `false` for all `vite build` invocations
# — including `vite build --watch`, which is what `npm run dev` runs. Force DEV
# to true during watch so the mock branch survives the dev bundle.
patch_vite_config_inject() {
  [[ -f "$VITE_CFG" ]] || return 0
  patch_file "$VITE_CFG" inject \
    "$BEGIN_DEFINE" "$END_DEFINE" \
    "    define: isWatch ? { 'import.meta.env.DEV': 'true' } : undefined," \
    "    publicDir: false,"
}

patch_auth_http_revert() {
  # Remove the import line. Match either the tagged form or the bare import —
  # eslint `import/order` auto-fix can strip the trailing sentinel comment.
  python3 - "$AUTH_HTTP" <<'PY'
import sys
path = sys.argv[1]
bare_import = "import { findMockResponse } from '@utils/api/mockRegistry'"
with open(path, 'r', encoding='utf-8') as fh:
    lines = fh.readlines()
lines = [
    l for l in lines
    if 'install-dev-mocks:import' not in l and l.strip() != bare_import
]
with open(path, 'w', encoding='utf-8') as fh:
    fh.writelines(lines)
PY
  # Remove the intercept block and restore expression-body thunk.
  python3 - "$AUTH_HTTP" "$BEGIN_INTERCEPT" "$END_INTERCEPT" <<'PY'
import sys, re
path, begin, end = sys.argv[1:4]
with open(path, 'r', encoding='utf-8') as fh:
    src = fh.read()
if begin not in src:
    sys.exit(0)
# Strip the marker block (and surrounding newline).
pattern = re.compile(
    r"\n?\s*" + re.escape(begin) + r"\n(?:.*\n)*?\s*" + re.escape(end) + r"\n"
)
src = pattern.sub("\n", src, count=1)
# Restore expression-body: undo `=> {`, `return fetch(`, trailing `}`.
src = src.replace(
    "      (): Promise<Return> => {\n        return fetch(",
    "      (): Promise<Return> =>\n        fetch(",
    1,
)
# Drop the matching closing `      }` that follows the first get()'s catch.
tail = "          .catch((error: Error | APIError) => handleException(error))\n      }\n"
replacement = "          .catch((error: Error | APIError) => handleException(error))\n"
src = src.replace(tail, replacement, 1)
with open(path, 'w', encoding='utf-8') as fh:
    fh.write(src)
PY
}

patch_index_tsx_revert() {
  patch_file "$INDEX_TSX" revert "$BEGIN_LOADER" "$END_LOADER" "" ""
}

patch_vite_config_revert() {
  [[ -f "$VITE_CFG" ]] || return 0
  patch_file "$VITE_CFG" revert "$BEGIN_DEFINE" "$END_DEFINE" "" ""
}

git_skip() {
  (cd "$TARGET" && git update-index --skip-worktree "$1" 2>/dev/null) || true
}
git_unskip() {
  (cd "$TARGET" && git update-index --no-skip-worktree "$1" 2>/dev/null) || true
}
git_tracked() {
  (cd "$TARGET" && git ls-files --error-unmatch "$1" >/dev/null 2>&1)
}

add_exclude() {
  mkdir -p "$(dirname "$GIT_EXCLUDE")"
  touch "$GIT_EXCLUDE"
  for p in "${EXCLUDE_PATHS[@]}"; do
    grep -qxF "$p" "$GIT_EXCLUDE" || echo "$p" >>"$GIT_EXCLUDE"
  done
}
remove_exclude() {
  [[ -f "$GIT_EXCLUDE" ]] || return 0
  local tmp
  tmp="$(mktemp)"
  for p in "${EXCLUDE_PATHS[@]}"; do
    grep -vxF "$p" "$GIT_EXCLUDE" >"$tmp" || true
    mv "$tmp" "$GIT_EXCLUDE"
    tmp="$(mktemp)"
  done
  rm -f "$tmp"
}

# ----------------------------------------------------------------------------
do_install() {
  require_layer_react

  # Refuse if target files already have uncommitted local edits (we'd clobber them).
  for f in "$AUTH_HTTP" "$INDEX_TSX" "$VITE_CFG"; do
    [[ -f "$f" ]] || continue
    rel="${f#$TARGET/}"
    if git_tracked "$rel" && ! (cd "$TARGET" && git diff --quiet -- "$rel"); then
      if ! grep -q "install-dev-mocks:" "$f"; then
        echo "error: $rel has uncommitted local changes; resolve before installing" >&2
        exit 1
      fi
    fi
  done

  write_vite_dts
  write_mock_registry
  scaffold_mocks_dir
  patch_auth_http_inject
  patch_index_tsx_inject
  patch_vite_config_inject

  add_exclude
  git_skip "src/utils/api/authenticatedHttp.ts"
  git_skip "src/index.tsx"
  [[ -f "$VITE_CFG" ]] && git_skip "vite/vite.config.ts"

  echo "installed dev mocks at $TARGET"
  echo "  new (git-ignored): src/types/vite.d.ts, src/utils/api/mockRegistry.ts, src/mocks/"
  echo "  patched (skip-worktree): src/utils/api/authenticatedHttp.ts, src/index.tsx, vite/vite.config.ts"
  echo "next: create src/mocks/<feature>.ts and register it in src/index.tsx"
}

do_uninstall() {
  require_layer_react

  git_unskip "src/utils/api/authenticatedHttp.ts"
  git_unskip "src/index.tsx"
  [[ -f "$VITE_CFG" ]] && git_unskip "vite/vite.config.ts"

  patch_auth_http_revert
  patch_index_tsx_revert
  patch_vite_config_revert

  rm -f "$VITE_DTS" "$MOCK_REG"
  # Archive user-authored mock files to a timestamped location before
  # removing the directory, so nothing valuable is lost on uninstall.
  if [[ -d "$MOCKS_DIR" ]]; then
    archive_root="/tmp/layer-react/mocks"
    stamp="$(date +%Y-%m-%d)"
    archived=0
    mkdir -p "$archive_root"
    while IFS= read -r -d '' src; do
      name="$(basename "$src")"
      [[ "$name" == "README.md" ]] && continue
      dest="${archive_root}/${stamp}-${name}"
      # If a file with the same timestamped name already exists, append a counter.
      n=2
      while [[ -e "$dest" ]]; do
        dest="${archive_root}/${stamp}-${name%.*}-${n}.${name##*.}"
        n=$((n + 1))
      done
      mv "$src" "$dest"
      echo "  archived: $dest"
      archived=$((archived + 1))
    done < <(find "$MOCKS_DIR" -maxdepth 1 -type f -print0)
    rm -rf "$MOCKS_DIR"
    [[ "$archived" -gt 0 ]] && echo "  archived $archived mock file(s) to $archive_root"
  fi
  rmdir "$(dirname "$VITE_DTS")" 2>/dev/null || true

  remove_exclude
  echo "uninstalled dev mocks at $TARGET"
}

do_status() {
  require_layer_react
  echo "target: $TARGET"
  for f in "$VITE_DTS" "$MOCK_REG"; do
    if [[ -f "$f" ]]; then echo "  present: ${f#$TARGET/}"; else echo "  absent:  ${f#$TARGET/}"; fi
  done
  for f in "$AUTH_HTTP" "$INDEX_TSX" "$VITE_CFG"; do
    [[ -f "$f" ]] || continue
    rel="${f#$TARGET/}"
    if grep -q "install-dev-mocks:" "$f" 2>/dev/null; then
      marker="patched"
    else
      marker="unpatched"
    fi
    if (cd "$TARGET" && git ls-files -v -- "$rel" 2>/dev/null | grep -q '^S'); then
      skip="skip-worktree"
    else
      skip="tracked"
    fi
    echo "  $rel: $marker, $skip"
  done
}

case "$MODE" in
  install)   do_install ;;
  uninstall) do_uninstall ;;
  status)    do_status ;;
  *)
    echo "Usage: install.sh <install|uninstall|status> [--path <dir>]" >&2
    exit 2
    ;;
esac
