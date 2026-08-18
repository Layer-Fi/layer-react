import {
  ComponentUsageAckSchema,
  type ComponentUsageBody,
  type ComponentUsageBodyEncoded,
  encodeComponentUsageBody,
} from '@schemas/common/componentUsage'
import { postWithoutErrorReporting } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const COMPONENT_USAGE_TAG_KEY = '#component-usage'

const logComponentUsage = postWithoutErrorReporting<
  typeof ComponentUsageAckSchema.Encoded,
  ComponentUsageBodyEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/component-usage`)

/**
 * Fire-and-forget prop-usage telemetry. Nothing is invalidated by it and failures stay local to this
 * mutation; the only thing read back is the sampling rate the backend wants for this business.
 */
export const usePostComponentUsage = createMutationHook({
  tags: [COMPONENT_USAGE_TAG_KEY],
  request: logComponentUsage,
  argToBody: (arg: ComponentUsageBody) => encodeComponentUsageBody(arg),
  schema: ComponentUsageAckSchema,
  select: ({ sampleRate }) => sampleRate ?? undefined,
  isLocalized: false,
  swrOptions: { throwOnError: false },
})
