// The published version, stamped onto outgoing request headers and event
// envelopes. This is the only module allowed to reach outside src — every other
// consumer imports it through the alias.
// eslint-disable-next-line import/no-relative-parent-imports
import pkg from '../../../../package.json'

export const PACKAGE_VERSION: string = pkg.version
