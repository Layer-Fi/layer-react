import { type FileMetadata } from '@internal-types/fileUpload'
import { BusinessTaskStatus } from '@schemas/businessTasks/businessTask'

import { patchTaskInStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const toTaskDocument = (file: File) => ({
  fileName: file.name,
  presignedUrl: {
    presignedUrl: `https://example.com/uploads/${encodeURIComponent(file.name)}`,
    fileType: file.type || 'application/octet-stream',
    fileName: file.name,
    createdAt: new Date(),
    documentId: crypto.randomUUID(),
  },
})

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
  resolve: async ({ override, request, params }: { override?: FileMetadata, request: Request, params: { taskId?: string | readonly string[] } }) => {
    if (override) return apiData(override)

    const formData = await request.formData()
    const files = formData.getAll('file').filter((entry): entry is File => entry instanceof File)
    const description = formData.get('description')

    if (files.length > 0) {
      patchTaskInStore(String(params.taskId), task => ({
        ...task,
        status: BusinessTaskStatus.UserMarkedCompleted,
        userResponse: typeof description === 'string' ? description : task.userResponse,
        documents: [...(task.documents ?? []), ...files.map(toTaskDocument)],
      }))
    }

    const [firstFile] = files

    return apiData(toFileMetadata(firstFile ?? new File([], 'upload')))
  },
})
