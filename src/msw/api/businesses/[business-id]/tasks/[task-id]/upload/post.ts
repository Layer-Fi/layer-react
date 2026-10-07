import { type FileMetadata } from '@internal-types/shared/fileUpload'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const toFileMetadata = (file: File): FileMetadata => ({
  type: 'File_Metadata',
  id: crypto.randomUUID(),
  fileType: file.type || 'application/octet-stream',
  fileName: file.name,
  documentType: 'OTHER',
})

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/tasks/:taskId/upload',
  resolve: async ({ override, request }: { override?: FileMetadata, request: Request }) => {
    if (override) return apiData(override)

    const formData = await request.formData()
    const files = formData.getAll('file').filter((entry): entry is File => entry instanceof File)

    const [firstFile] = files

    return apiData(toFileMetadata(firstFile ?? new File([], 'upload')))
  },
})
