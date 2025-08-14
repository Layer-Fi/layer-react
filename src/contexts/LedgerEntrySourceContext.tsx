import { createInAppLinkContext } from './InAppLinkContext'
import { LedgerEntrySourceType } from '../schemas/ledgerEntrySourceSchemas'

export const {
  InAppLinkProvider: LedgerEntrySourceLinkProvider,
  useInAppLinkContext: useLedgerEntrySourceLinkContext,
} = createInAppLinkContext<LedgerEntrySourceType>()
