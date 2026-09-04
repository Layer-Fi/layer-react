import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type DocumentWithStatus } from '@internal-types/shared/fileUpload'
import { ReceiptsContext } from '@providers/features/bankTransactions/Receipts/ReceiptsContext'
import { BankTransactionReceipts } from '@features/bankTransactions/BankTransactionReceipts/BankTransactionReceipts'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const IMAGE_RECEIPT_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTYwIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2YzZjRmNiIvPjxyZWN0IHg9IjE2IiB5PSIyMCIgd2lkdGg9Ijg4IiBoZWlnaHQ9IjEyIiBmaWxsPSIjOWNhM2FmIi8+PHJlY3QgeD0iMTYiIHk9IjQ4IiB3aWR0aD0iODgiIGhlaWdodD0iOCIgZmlsbD0iI2QxZDVkYiIvPjxyZWN0IHg9IjE2IiB5PSI2OCIgd2lkdGg9Ijg4IiBoZWlnaHQ9IjgiIGZpbGw9IiNkMWQ1ZGIiLz48cmVjdCB4PSIxNiIgeT0iODgiIHdpZHRoPSI1NiIgaGVpZ2h0PSI4IiBmaWxsPSIjZDFkNWRiIi8+PHJlY3QgeD0iMTYiIHk9IjEyNCIgd2lkdGg9Ijg4IiBoZWlnaHQ9IjEyIiBmaWxsPSIjOWNhM2FmIi8+PC9zdmc+'

const PDF_RECEIPT_URL = 'https://example.com/receipts/invoice.pdf'

const pdfReceipt: DocumentWithStatus = {
  id: 'receipt-pdf',
  url: PDF_RECEIPT_URL,
  status: 'uploaded',
  type: 'application/pdf',
  name: 'invoice.pdf',
  date: 'Jul 24, 2026',
}

const imageReceipt: DocumentWithStatus = {
  id: 'receipt-image',
  url: IMAGE_RECEIPT_URL,
  status: 'uploaded',
  type: 'image/svg+xml',
  name: 'receipt-photo.svg',
  date: 'Jul 24, 2026',
}

const FLOATING_ACTIONS_STYLES = `
  .StoryFloatingActions {
    padding-block-start: 28px;
    padding-inline-end: 16px;
  }

  .StoryFloatingActions .Layer__file-thumb__actions--floating {
    display: flex;
  }
`

const makeContextValue = (receiptUrls: Array<DocumentWithStatus>) => ({
  receiptUrls,
  uploadReceipt: () => Promise.resolve(),
  archiveDocument: () => Promise.resolve(),
})

const meta: Meta<typeof BankTransactionReceipts> = {
  title: 'Scratch/BankTransactionReceipts',
  component: BankTransactionReceipts,
  parameters: { chromatic: { viewports: [1280] } },
  decorators: [
    Story => (
      <div className='Layer__component'>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof BankTransactionReceipts>

export const PdfVersusImageReceipt: Story = {
  render: () => (
    <Gallery direction='row' wrap gap={24}>
      <Col inlineSize={280} label='PDF receipt — download only'>
        <ReceiptsContext.Provider value={makeContextValue([pdfReceipt])}>
          <BankTransactionReceipts hideUploadButtons />
        </ReceiptsContext.Provider>
      </Col>
      <Col inlineSize={280} label='Image receipt — preview and download'>
        <ReceiptsContext.Provider value={makeContextValue([imageReceipt])}>
          <BankTransactionReceipts hideUploadButtons />
        </ReceiptsContext.Provider>
      </Col>
    </Gallery>
  ),
}

export const FloatingActionsPdfVersusImageReceipt: Story = {
  render: () => (
    <Gallery direction='row' wrap gap={24}>
      <style>{FLOATING_ACTIONS_STYLES}</style>
      <Col inlineSize={280} label='PDF receipt, floating actions — delete and download only'>
        <div className='StoryFloatingActions'>
          <ReceiptsContext.Provider value={makeContextValue([pdfReceipt])}>
            <BankTransactionReceipts hideUploadButtons floatingActions />
          </ReceiptsContext.Provider>
        </div>
      </Col>
      <Col inlineSize={280} label='Image receipt, floating actions — delete, download and preview'>
        <div className='StoryFloatingActions'>
          <ReceiptsContext.Provider value={makeContextValue([imageReceipt])}>
            <BankTransactionReceipts hideUploadButtons floatingActions />
          </ReceiptsContext.Provider>
        </div>
      </Col>
    </Gallery>
  ),
}
