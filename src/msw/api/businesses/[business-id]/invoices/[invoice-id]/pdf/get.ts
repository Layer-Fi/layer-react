import { Schema } from 'effect'

import { S3PresignedUrlSchema } from '@schemas/common/s3PresignedUrl'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

// A minimal one-page PDF ("Mock invoice PDF") as a data URL, so downloads
// opened from a story actually render instead of 404ing.
const MOCK_INVOICE_PDF_DATA_URL = 'data:application/pdf;base64,'
  + 'JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCjUgMCBvYmoKPDwvTGVuZ3RoIDQ3Pj5zdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDcyMCBUZCAoTW9jayBpbnZvaWNlIFBERikgVGogRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1NCAwMDAwMCBuIAowMDAwMDAwMTA1IDAwMDAwIG4gCjAwMDAwMDAyMTcgMDAwMDAgbiAKMDAwMDAwMDI4MCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNi9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjM3NAolJUVPRgo='

const encodePresignedUrl = Schema.encodeSync(S3PresignedUrlSchema)

export const get = createMockEndpoint<undefined, ReturnType<typeof apiData>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/invoices/:invoiceId/pdf',
  resolve: ({ params }) =>
    apiData(encodePresignedUrl({
      presignedUrl: MOCK_INVOICE_PDF_DATA_URL,
      fileType: 'application/pdf',
      fileName: `invoice-${params.invoiceId as string}.pdf`,
      createdAt: new Date(),
      documentId: null,
    })),
})
