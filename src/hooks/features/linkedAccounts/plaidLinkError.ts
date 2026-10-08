import { type PlaidLinkOnExit } from 'react-plaid-link'

import { type LinkMode } from '@hooks/features/linkedAccounts/usePlaidLinkModal'

type PlaidLinkExitError = NonNullable<Parameters<PlaidLinkOnExit>[0]>
type PlaidLinkExitMetadata = Parameters<PlaidLinkOnExit>[1]

export class PlaidLinkError extends Error {
  errorType: string
  errorCode: string
  displayMessage: string | null
  linkSessionId: string
  requestId: string
  institution: PlaidLinkExitMetadata['institution']
  linkMode: LinkMode

  constructor(error: PlaidLinkExitError, metadata: PlaidLinkExitMetadata, linkMode: LinkMode) {
    super(error.error_message)
    this.name = 'PlaidLinkError'
    this.errorType = error.error_type
    this.errorCode = error.error_code
    // Typed as string, but Plaid sends null when there is nothing to show the user.
    this.displayMessage = error.display_message ?? null
    this.linkSessionId = metadata.link_session_id
    this.requestId = metadata.request_id
    this.institution = metadata.institution
    this.linkMode = linkMode

    Object.setPrototypeOf(this, PlaidLinkError.prototype)
  }
}
