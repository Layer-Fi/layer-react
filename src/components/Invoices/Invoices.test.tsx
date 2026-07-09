import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Invoices } from '@components/Invoices/Invoices'

import { invoices } from '@fixtures/generated/invoices.gen'
import { LayerTestProvider } from '@test-utils/LayerTestProvider'

describe(Invoices, () => {
  it('renders the seeded invoices from the mock API', async () => {
    render(<Invoices />, { wrapper: LayerTestProvider })

    const [newestInvoice] = invoices

    expect(await screen.findByText(newestInvoice.invoiceNumber ?? '', undefined, { timeout: 5000 }))
      .toBeVisible()
  })
})
