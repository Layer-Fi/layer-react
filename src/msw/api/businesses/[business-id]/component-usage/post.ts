import { Schema } from 'effect'

import { type ComponentUsageAck, ComponentUsageAckSchema } from '@schemas/common/componentUsage'

import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeComponentUsageAck = Schema.encodeSync(ComponentUsageAckSchema)

export const post = createMockEndpoint<ComponentUsageAck, typeof ComponentUsageAckSchema.Encoded>({
  method: 'post',
  path: '*/v1/businesses/:businessId/component-usage',
  resolve: ({ override = { sampleRate: 1 } }) => encodeComponentUsageAck(override),
})
