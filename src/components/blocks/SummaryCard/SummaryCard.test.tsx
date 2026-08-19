import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SummaryCard, type SummaryCardProps } from '@blocks/SummaryCard/SummaryCard'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const DEFAULT_PROPS: SummaryCardProps = {
  slots: { title: 'Revenue' },
  children: <span>Card content</span>,
}

const renderSummaryCard = (props: Partial<SummaryCardProps> = {}) =>
  render(<SummaryCard {...DEFAULT_PROPS} {...props} />, { wrapper: LayerTestProvider })

describe('SummaryCard', () => {
  it('renders a string title as a heading and the children as content', () => {
    renderSummaryCard()

    expect(screen.getByRole('heading', { name: 'Revenue' })).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders a non-string title node as-is, without wrapping it in a heading', () => {
    renderSummaryCard({ slots: { title: <button type='button'>Custom title</button> } })

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom title' })).toBeInTheDocument()
  })

  it('renders a string subtitle and omits the subtitle wrapper when none is given', () => {
    const { rerender } = renderSummaryCard({ slots: { title: 'Revenue', subtitle: 'Last 30 days' } })

    expect(screen.getByText('Last 30 days')).toBeInTheDocument()

    rerender(<SummaryCard {...DEFAULT_PROPS} />)

    expect(screen.queryByText('Last 30 days')).not.toBeInTheDocument()
  })

  it('renders legend and primaryAction when provided', () => {
    renderSummaryCard({
      slots: {
        title: 'Revenue',
        legend: <span>Legend content</span>,
        primaryAction: <button type='button'>Export</button>,
      },
    })

    expect(screen.getByText('Legend content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })
})
