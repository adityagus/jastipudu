import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
const files = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean)
const patterns = [
  /sb_secret_[A-Za-z0-9_-]{12,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /postgres(?:ql)?:\/\/[^\s:]+:[^\s@]+@/,
]
const violations = []
for (const file of files) {
  if (file === 'scripts/check-secrets.mjs') continue
  if (/^\.env(?:\.|$)/.test(file) && file !== '.env.example') violations.push(file)
  const content = await readFile(file, 'utf8')
  if (patterns.some((pattern) => pattern.test(content))) violations.push(file)
}
if (violations.length) {
  console.error('Potential secrets in: ' + violations.join(', '))
  process.exit(1)
}
console.log(
  'PASS: no credential patterns or private environment files in ' +
    files.length +
    ' repository files (heuristic scan).',
)
