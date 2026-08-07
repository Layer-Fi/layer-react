// Shared by the workflows that report to Slack from `actions/github-script`. CommonJS because
// that is the context github-script's `require` runs in.

const SEVERITY_EMOJI = { critical: '🚨', high: '🔴', moderate: '🟠', low: '🟡' }

const truncate = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

const header = text => ({ type: 'header', text: { type: 'plain_text', text, emoji: true } })
const section = text => ({ type: 'section', text: { type: 'mrkdwn', text } })
const context = text => ({ type: 'context', elements: [{ type: 'mrkdwn', text }] })
const divider = () => ({ type: 'divider' })

// A section's text caps at 3000 chars; splitting keeps a long list from being rejected whole.
const sections = (lines) => {
  const chunks = [[]]
  let size = 0
  for (const line of lines) {
    if (size + line.length + 1 > 2800 && chunks.at(-1).length) {
      chunks.push([])
      size = 0
    }
    chunks.at(-1).push(line)
    size += line.length + 1
  }
  return chunks.filter(chunk => chunk.length).map(chunk => section(chunk.join('\n')))
}

// An empty group gets a header rather than a body line: nothing to report is the result worth
// reading at a glance, and the meta line above it still carries the legend.
const group = ({ title, count, meta, lines = [] }) => [
  divider(),
  section(`*[${count ?? lines.length}] ${title}*`),
  ...(meta ? [context(meta)] : []),
  ...(lines.length > 0 ? sections(lines) : [header('None! ✨')]),
]

const prLine = pr => `[<${pr.url}|#${pr.number}>] ${truncate(pr.title, 88)}`

const SEP = '  ·  '
const ROW_SEP = ' · '

// The group line both reports use: non-zero counts, then whatever note belongs beside them.
const metaLine = (...parts) => parts.filter(Boolean).join(SEP)

// One finding per line: the package, then whatever facts that report has about it. Only the
// name is code-formatted — a row of boxes is what the versions used to read as.
const row = (icon, name, ...facts) => [`${icon} \`${name}\``, ...facts.filter(Boolean)].join(ROW_SEP)
const tally = entries => entries
  .filter(([, count]) => count > 0)
  .map(([emoji, count, label]) => `${emoji} ${count} ${label}`)
  .join(SEP)

// Slack caps a message at 50 blocks; the footer is worth more than the tail of a list.
const capBlocks = blocks => (blocks.length > 50 ? [...blocks.slice(0, 49), blocks.at(-1)] : blocks)

// Rows are ordered by urgency, so an overflow drops the least urgent and says so.
const limited = (lines, max, more = 'in the run summary') =>
  (lines.length > max ? [...lines.slice(0, max), `_+${lines.length - max} more ${more}._`] : lines)

module.exports = {
  SEVERITY_EMOJI,
  capBlocks,
  context,
  divider,
  group,
  header,
  limited,
  metaLine,
  prLine,
  row,
  section,
  sections,
  tally,
  truncate,
}
