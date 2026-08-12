import { useEffect, useRef, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { CircleCheck } from 'lucide-react'
import { expect } from 'storybook/test'

import { BadgeVariant } from '@ui/Badge/Badge'
import { MobileListItemStatusFooter } from '@blocks/MobileList/MobileListItemStatusFooter'

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

const meta: Meta<typeof MobileListItemStatusFooter> = {
  title: 'Blocks/MobileList/MobileListItemStatusFooter (scratch)',
  component: MobileListItemStatusFooter,
}

export default meta

type Story = StoryObj<typeof MobileListItemStatusFooter>

const INVOICE_LEGACY_CLASS_NAMES = {
  root: 'Layer__InvoicesMobileListItem__StatusFooter',
  icon: 'Layer__InvoicesMobileListItem__StatusFooter__Icon',
  dot: 'Layer__InvoicesMobileListItem__StatusFooter__Dot',
}

/**
 * The unchanged state: trips and categorization-rule lists render this footer without passing any
 * legacy names, so only the shared `Layer__UI__MobileListItemStatusFooter*` names appear.
 */
export const SharedFooterWithoutCallerNames: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.innerHTML).not.toContain('Layer__InvoicesMobileListItem__StatusFooter')
    await expect(
      canvasElement.querySelector('.Layer__UI__MobileListItemStatusFooter'),
    ).not.toBeNull()
  },
  render: () => (
    <Gallery gap={32}>
      <EmittedClasses label='no legacyClassNames — trips / categorization rules'>
        <MobileListItemStatusFooter
          variant={BadgeVariant.SUCCESS}
          text='Business'
          slots={{ Icon: CircleCheck }}
        />
      </EmittedClasses>
      <EmittedClasses label='no legacyClassNames, dot variant'>
        <MobileListItemStatusFooter variant={BadgeVariant.NEUTRAL} text='Suggests a category' />
      </EmittedClasses>
    </Gallery>
  ),
}

/**
 * The changed state: the invoice caller supplies its own names, so
 * `Layer__InvoicesMobileListItem__StatusFooter*` is emitted only where invoices render the footer.
 */
export const SharedFooterWithInvoiceNames: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('.Layer__InvoicesMobileListItem__StatusFooter'),
    ).not.toBeNull()
    await expect(
      canvasElement.querySelector('.Layer__InvoicesMobileListItem__StatusFooter__Icon'),
    ).not.toBeNull()
  },
  render: () => (
    <Gallery gap={32}>
      <EmittedClasses label='legacyClassNames supplied by the invoice caller'>
        <MobileListItemStatusFooter
          variant={BadgeVariant.SUCCESS}
          text='Paid'
          subText='Jul 23'
          slots={{ Icon: CircleCheck }}
          legacyClassNames={INVOICE_LEGACY_CLASS_NAMES}
        />
      </EmittedClasses>
      <EmittedClasses label='legacyClassNames supplied, dot variant'>
        <MobileListItemStatusFooter
          variant={BadgeVariant.WARNING}
          text='Outstanding'
          legacyClassNames={INVOICE_LEGACY_CLASS_NAMES}
        />
      </EmittedClasses>
    </Gallery>
  ),
}
