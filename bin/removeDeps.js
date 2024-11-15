const { devDependencies, peerDependencies } = require('../package.json')
const { rm } = require('fs/promises')

const unnecessaryDeps = [
  ...Object.keys(peerDependencies || {}),
]

Promise.all(
  unnecessaryDeps.map(dep =>
    rm(`node_modules/${dep}`, { recursive: true, force: true })
  )
)
.then(() => console.log(`${unnecessaryDeps.length} dependencies removed`))
