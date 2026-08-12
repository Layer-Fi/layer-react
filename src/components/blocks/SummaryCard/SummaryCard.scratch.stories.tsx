import { useEffect, useRef, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { Button } from '@ui/Button/Button'
import { Span } from '@ui/Typography/Text'
import { SummaryCard } from '@blocks/SummaryCard/SummaryCard'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

/*
 * Class names are invisible in a normal render, so this reads the emitted `class` attribute back
 * out and prints it. Scratch-only: it exists to make the legacy-name restoration reviewable.
 */
const EmittedClasses = ({ label, children }: { label: string, children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [emitted, setEmitted] = useState<string[]>([])

  useEffect(() => {
    const root = ref.current?.firstElementChild
    if (!root) return

    setEmitted(
      [root, ...root.querySelectorAll('[class]')]
        .map(element => element.getAttribute('class') ?? '')
        .filter(Boolean),
    )
  }, [])

  return (
    <Col label={label}>
      <div ref={ref}>{children}</div>
      {emitted.map(value => (
        <code key={value} style={{ fontSize: 11, display: 'block', maxInlineSize: 620 }}>{value}</code>
      ))}
    </Col>
  )
}

const meta: Meta<typeof SummaryCard> = {
  title: 'Blocks/SummaryCard (scratch)',
  component: SummaryCard,
}

export default meta

type Story = StoryObj<typeof SummaryCard>

/**
 * The unchanged state: a card that passes no legacy names, and no primary action. Neither
 * `Layer__SummaryCard__HeaderPrimaryAction` nor any caller-supplied name appears.
 */
export const WithoutPrimaryActionOrCallerNames: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.innerHTML).not.toContain('Layer__SummaryCard__HeaderPrimaryAction')
    await expect(canvasElement.innerHTML).not.toContain('Layer__MileageTrackingSummary__Header')
    await expect(canvasElement.innerHTML).not.toContain('Layer__TaxEstimatesSummaryCard__Body')
    await expect(canvasElement.querySelector('.Layer__SummaryCard__Body')).not.toBeNull()
  },
  render: () => (
    <Gallery gap={32}>
      <EmittedClasses label='no primaryAction, no legacyClassNames'>
        <SummaryCard slots={{ title: 'Summary', subtitle: '2026' }}>
          <Span>Content</Span>
        </SummaryCard>
      </EmittedClasses>
    </Gallery>
  ),
}

/**
 * The changed state: the primary action regains its own wrapper, and the mileage and tax-estimate
 * cards supply the header and body names they each shipped under.
 */
export const WithPrimaryActionAndCallerNames: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('.Layer__SummaryCard__HeaderPrimaryAction'),
    ).not.toBeNull()
    await expect(
      canvasElement.querySelector('.Layer__SummaryCard__Header.Layer__MileageTrackingSummary__Header'),
    ).not.toBeNull()
    await expect(
      canvasElement.querySelector('.Layer__SummaryCard__Body.Layer__TaxEstimatesSummaryCard__Body'),
    ).not.toBeNull()
  },
  render: () => (
    <Gallery gap={32}>
      <EmittedClasses label='primaryAction wrapper + mileage header name'>
        <SummaryCard
          slots={{ title: 'Mileage Tracking', subtitle: '2026', primaryAction: <Button>View</Button> }}
          legacyClassNames={{ header: 'Layer__MileageTrackingSummary__Header' }}
        >
          <Span>Content</Span>
        </SummaryCard>
      </EmittedClasses>
      <EmittedClasses label='tax-estimates body name'>
        <SummaryCard
          slots={{ title: 'Tax Estimates', subtitle: '2026' }}
          legacyClassNames={{ body: 'Layer__TaxEstimatesSummaryCard__Body' }}
        >
          <Span>Content</Span>
        </SummaryCard>
      </EmittedClasses>
    </Gallery>
  ),
}
