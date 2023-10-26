const { devDependencies, peerDependencies } = require('../package.json')
const fsp = require('fs/promises')

const unnecessaryDeps = [
  ...Object.keys(devDependencies || {}),
  ...Object.keys(peerDependencies || {}),
]
unnecessaryDeps.forEach(dep =>
  fsp.rm(`../../module/node_modules/${dep}`, { recursive: true, force: true }),
)
