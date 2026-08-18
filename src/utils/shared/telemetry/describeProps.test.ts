import { describe, expect, it } from 'vitest'

import { describeProps } from '@utils/shared/telemetry/describeProps'

describe(describeProps, () => {
  it('records a boolean prop with its literal value', () => {
    expect(describeProps({ showTitle: false })).toEqual([
      { name: 'showTitle', kind: 'boolean', booleanValue: false },
    ])
  })

  it('treats an explicitly undefined prop as absent', () => {
    expect(describeProps({ showTitle: undefined })).toEqual([])
  })

  it('distinguishes an explicit null from an absent prop', () => {
    expect(describeProps({ middleBanner: null })).toEqual([
      { name: 'middleBanner', kind: 'null' },
    ])
  })

  it('records the kind of each non-object prop', () => {
    expect(describeProps({
      count: 3,
      onError: () => {},
      view: 'mobile',
    })).toEqual([
      { name: 'count', kind: 'number' },
      { name: 'onError', kind: 'function' },
      { name: 'view', kind: 'string' },
    ])
  })

  it('flattens the key paths of a config object, without its values', () => {
    const described = describeProps({
      stringOverrides: {
        header: { title: 'Transactions' },
        transactionsTable: { dateColumnHeader: 'Date' },
      },
    })

    expect(described).toEqual([
      {
        name: 'stringOverrides',
        kind: 'object',
        keys: ['header.title', 'transactionsTable.dateColumnHeader'],
      },
    ])
  })

  it('does not report a nested key whose value is undefined', () => {
    const described = describeProps({
      stringOverrides: { title: undefined, dateColumnHeader: 'Date' },
    })

    expect(described).toEqual([
      { name: 'stringOverrides', kind: 'object', keys: ['dateColumnHeader'] },
    ])
  })

  it('still reports a nested key set explicitly to null', () => {
    expect(describeProps({ stringOverrides: { title: null } })).toEqual([
      { name: 'stringOverrides', kind: 'object', keys: ['title'] },
    ])
  })

  it('reports a branch whose every leaf is undefined, but none of its leaves', () => {
    expect(describeProps({ stringOverrides: { header: { title: undefined } } })).toEqual([
      { name: 'stringOverrides', kind: 'object', keys: ['header'] },
    ])
  })

  it('stops flattening at three levels deep', () => {
    const described = describeProps({
      slotProps: { profitAndLoss: { chart: { chartConfig: { barWidth: 4 } } } },
    })

    expect(described).toEqual([
      { name: 'slotProps', kind: 'object', keys: ['profitAndLoss.chart.chartConfig'] },
    ])
  })

  it('caps the number of key paths it reports', () => {
    const wide = Object.fromEntries(
      Array.from({ length: 80 }, (_, index) => [`key${String(index).padStart(2, '0')}`, 'value']),
    )

    expect(describeProps({ stringOverrides: wide })[0]?.keys).toHaveLength(50)
  })

  it('reports a non-plain object without reading into it', () => {
    expect(describeProps({ asOf: new Date('2026-01-01') })).toEqual([
      { name: 'asOf', kind: 'object' },
    ])
  })

  it('reports an array of primitives as an array', () => {
    expect(describeProps({ chartColorsList: ['#000', '#fff'] })).toEqual([
      { name: 'chartColorsList', kind: 'array' },
    ])
  })

  it('sorts props by name so equal combinations serialize identically', () => {
    expect(describeProps({ showTitle: true, asWidget: true }).map(({ name }) => name))
      .toEqual(['asWidget', 'showTitle'])
  })
})
