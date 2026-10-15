import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { TimeTrackingServicesDrawer, type TimeTrackingServicesDrawerProps } from '@features/timeTracking/TimeTrackingServicesDrawer/TimeTrackingServicesDrawer'

import { makeCatalogService } from '@fixtures/catalogServices/mocks'
import { get as getCatalogServices } from '@msw/api/businesses/[business-id]/catalog/services/get'
import { server } from '@msw/node'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const CONSULTING = makeCatalogService({
  id: '00000000-0000-4000-8000-000000000611',
  name: 'Consulting',
})
const BOOKKEEPING = makeCatalogService({
  id: '00000000-0000-4000-8000-000000000612',
  name: 'Bookkeeping',
})
const AUDIT_PREP = makeCatalogService({
  id: '00000000-0000-4000-8000-000000000613',
  name: 'Audit Prep',
  archivedAt: new Date('2026-01-15T00:00:00Z'),
})

const renderServicesDrawer = async (props: Partial<TimeTrackingServicesDrawerProps> = {}) => {
  server.use(getCatalogServices.mock([CONSULTING, BOOKKEEPING, AUDIT_PREP]))
  const user = userEvent.setup()
  const result = render(
    <TimeTrackingServicesDrawer isOpen onOpenChange={() => {}} {...props} />,
    { wrapper: LayerTestProvider },
  )
  const drawer = await screen.findByRole('dialog', { name: 'Services' })

  return { user, drawer, ...result }
}

describe('TimeTrackingServicesDrawer', () => {
  it('keeps a service row mounted and focused when it is expanded', async () => {
    const { user, drawer } = await renderServicesDrawer()
    const consultingRow = await within(drawer).findByRole('button', { name: /Consulting/ })

    await user.click(consultingRow)

    expect(consultingRow).toBeInTheDocument()
    expect(consultingRow).toHaveFocus()
    expect(await within(drawer).findByDisplayValue('Consulting')).toBeInTheDocument()
  })

  it('keeps the archived row mounted while its restore dialog is open', async () => {
    const { user, drawer } = await renderServicesDrawer()

    await user.click(within(drawer).getByRole('radio', { name: 'Archived' }))
    const restoreButton = await within(drawer).findByRole('button', { name: 'Restore' })

    await user.click(restoreButton)

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(restoreButton).toBeInTheDocument()
  })
})
