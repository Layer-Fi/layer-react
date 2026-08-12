import { type ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SummaryCard } from '@blocks/SummaryCard/SummaryCard'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const renderSummaryCard = (ui: ReactElement) => render(ui, { wrapper: LayerTestProvider })

describe('SummaryCard', () => {
  it('renders a string title as a heading and the children as content', () => {
    renderSummaryCard(
      <SummaryCard slots={{ title: 'Revenue' }}>
        <span>Card content</span>
      </SummaryCard>,
    )

    expect(screen.getByRole('heading', { name: 'Revenue' })).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders a non-string title node as-is, without wrapping it in a heading', () => {
    renderSummaryCard(
      <SummaryCard slots={{ title: <button type='button'>Custom title</button> }}>
        <span>Card content</span>
      </SummaryCard>,
    )

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom title' })).toBeInTheDocument()
  })

  it('renders a string subtitle and omits the subtitle wrapper when none is given', () => {
    const { rerender } = renderSummaryCard(
      <SummaryCard slots={{ title: 'Revenue', subtitle: 'Last 30 days' }}>
        <span>Card content</span>
      </SummaryCard>,
    )

    expect(screen.getByText('Last 30 days')).toBeInTheDocument()

    rerender(
      <SummaryCard slots={{ title: 'Revenue' }}>
        <span>Card content</span>
      </SummaryCard>,
    )

    expect(screen.queryByText('Last 30 days')).not.toBeInTheDocument()
  })

  it('renders legend and primaryAction when provided', () => {
    renderSummaryCard(
      <SummaryCard
        slots={{
          title: 'Revenue',
          legend: <span>Legend content</span>,
          primaryAction: <button type='button'>Export</button>,
        }}
      >
        <span>Card content</span>
      </SummaryCard>,
    )

    expect(screen.getByText('Legend content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })
})
