import { type FileMetadata } from '@internal-types/fileUpload'

import { bankTransactionDocumentsStore, findDocuments } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/documents/store'
import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const toResponse = (fileMetadata: FileMetadata) => apiData(fileMetadata)

export const post = createMockEndpoint<FileMetadata, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId/documents',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const bankTransactionId = params.bankTransactionId as string
    const formData = await request.formData()
    const file = formData.get('file')
    const documentTypeField = formData.get('documentType')
    const documentType = (
      typeof documentTypeField === 'string' ? documentTypeField : 'RECEIPT'
    ) as FileMetadata['documentType']

    const fileName = file instanceof File ? file.name : 'receipt.pdf'
    const fileType = file instanceof File && file.type !== '' ? file.type : 'application/pdf'
    const documentId = crypto.randomUUID()

    const documents = findDocuments(bankTransactionId)
    bankTransactionDocumentsStore.save({
      ...documents,
      documentUrls: [
        ...documents.documentUrls,
        {
          type: 'S3_Presigned_Url',
          presignedUrl: `https://mock-s3.test/${bankTransactionId}/${documentId}/${encodeURIComponent(fileName)}`,
          fileType,
          fileName,
          createdAt: new Date().toISOString(),
          documentId,
        },
      ],
    })

    const transaction = findOrSeedBankTransaction(bankTransactionId)
    bankTransactionStore.save({
      ...transaction,
      documentIds: [...transaction.documentIds, documentId],
    })

    return toResponse({
      type: 'File_Metadata',
      id: documentId,
      fileType,
      fileName,
      documentType,
    })
  },
})
