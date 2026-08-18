import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { ComponentUsageAckSchema, ComponentUsageBodySchema, encodeComponentUsageBody } from '@schemas/common/componentUsage'

describe('component usage wire contract', () => {
  it('decodes the envelope the api actually returns, discriminator included', () => {
    const fromApi = { data: { type: 'Component_Usage_Acknowledgement', sample_rate: 0.02 } }

    expect(Schema.decodeUnknownSync(ComponentUsageAckSchema)(fromApi)).toEqual({ sampleRate: 0.02 })
  })

  it('decodes an envelope with no sample rate', () => {
    expect(Schema.decodeUnknownSync(ComponentUsageAckSchema)({ data: {} })).toEqual({})
  })

  it('encodes the body shape the api expects', () => {
    expect(encodeComponentUsageBody({
      component: 'BankTransactions',
      parentComponent: null,
      environment: 'production',
      props: [
        { name: 'showTitle', kind: 'boolean', booleanValue: false },
        { name: 'stringOverrides', kind: 'object', keys: ['header.title'] },
      ],
    })).toEqual({
      component: 'BankTransactions',
      parent_component: null,
      environment: 'production',
      props: [
        { name: 'showTitle', kind: 'boolean', boolean_value: false },
        { name: 'stringOverrides', kind: 'object', keys: ['header.title'] },
      ],
    })
  })

  it('round-trips through the body schema', () => {
    const body = { component: 'Tasks', parentComponent: 'BookkeepingOverview', props: [] }

    expect(Schema.decodeUnknownSync(ComponentUsageBodySchema)(encodeComponentUsageBody(body))).toEqual(body)
  })
})
