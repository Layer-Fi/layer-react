import process from 'node:process'
import { pathToFileURL } from 'node:url'

// The versioning model the release workflows implement: the cycle target is fixed at the
// first alpha (X.Y.Z-alpha.N) and stable drops the suffix to ship X.Y.Z.
//
//   alpha  from a stable      -> pre<increment>, e.g. 0.1.144 -> 0.1.145-alpha.0
//   alpha  from a prerelease  -> 0.1.145-alpha.0 -> 0.1.145-alpha.1  (increment ignored)
//   stable from a prerelease  -> 0.1.145-alpha.2 -> 0.1.145         (increment ignored)
//   stable from a stable      -> bump per increment, 0.1.145 -> 0.1.146 / 0.2.0 / 1.0.0

const parse = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-alpha\.(\d+))?$/.exec(version ?? '')
  if (!match) {
    throw new Error(`Unsupported version: ${version}`)
  }
  const [, major, minor, patch, prerelease] = match
  return {
    base: `${major}.${minor}.${patch}`,
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: prerelease === undefined ? null : Number(prerelease),
  }
}

export const bumpVersion = (version, increment) => {
  const { major, minor, patch } = parse(version)
  switch (increment) {
    case 'major': return `${major + 1}.0.0`
    case 'minor': return `${major}.${minor + 1}.0`
    case 'patch': return `${major}.${minor}.${patch + 1}`
    default: throw new Error(`Unsupported increment: ${increment}`)
  }
}

export const nextReleaseVersion = (current, releaseType, increment) => {
  const { base, prerelease } = parse(current)

  if (releaseType === 'stable') {
    return prerelease === null ? bumpVersion(base, increment) : base
  }
  if (releaseType !== 'alpha') {
    throw new Error(`Unsupported release type: ${releaseType}`)
  }
  return prerelease === null
    ? `${bumpVersion(base, increment)}-alpha.0`
    : `${base}-alpha.${prerelease + 1}`
}

const USAGE = `Usage: node scripts/release/nextVersion.mjs release <current> <alpha|stable> <patch|minor|major>
       node scripts/release/nextVersion.mjs bump <version> <patch|minor|major>`

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, ...args] = process.argv.slice(2)
  try {
    if (command === 'release') {
      console.log(nextReleaseVersion(args[0], args[1], args[2]))
    }
    else if (command === 'bump') {
      console.log(bumpVersion(args[0], args[1]))
    }
    else {
      throw new Error(USAGE)
    }
  }
  catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
