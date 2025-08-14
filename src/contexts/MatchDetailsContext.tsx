import { createInAppLinkContext } from './InAppLinkContext'
import { MatchDetailsType } from '../schemas/matchSchemas'

export const {
  InAppLinkProvider: MatchDetailsLinkProvider,
  useInAppLinkContext: useMatchDetailsLinkContext,
} = createInAppLinkContext<MatchDetailsType>()
