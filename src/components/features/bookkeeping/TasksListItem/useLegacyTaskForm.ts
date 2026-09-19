import { useMemo, useState } from 'react'

import { BusinessTaskStatus, TaskUserResponseType } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type LegacyBusinessTask } from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'
import { useDeleteTaskUploads } from '@api/businesses/[business-id]/tasks/[task-id]/upload/delete/post'
import { usePostTaskUpload } from '@api/businesses/[business-id]/tasks/[task-id]/upload/post'
import { usePostTaskUploadDescription } from '@api/businesses/[business-id]/tasks/[task-id]/upload/update-description/post'
import { usePostTaskUserResponse } from '@api/businesses/[business-id]/tasks/[task-id]/user-response/post'
import { useAppForm } from '@blocks/Form/useForm'

export type LegacyTaskFormValues = {
  userResponse: string
}

type UseLegacyTaskFormProps = {
  task: LegacyBusinessTask
  onAnswered: () => void
}

// Files stay outside the form: File instances are class values, which the form's
// deep value types cannot model.
export const useLegacyTaskForm = ({ task, onAnswered }: UseLegacyTaskFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>()

  const { trigger: postUserResponse } = usePostTaskUserResponse()
  const { trigger: uploadDocuments } = usePostTaskUpload()
  const { trigger: deleteUploads, isMutating: isDeletingUploads } = useDeleteTaskUploads()
  const { trigger: updateUploadDescription } = usePostTaskUploadDescription()

  const isUpload = task.userResponseType === TaskUserResponseType.UploadDocument
  // Editing the description of uploads already sent keeps the card open.
  const isDescriptionUpdate = isUpload && task.status !== BusinessTaskStatus.Todo

  const form = useAppForm<LegacyTaskFormValues>({
    defaultValues: { userResponse: task.userResponse ?? '' },
    onSubmit: async ({ value: { userResponse } }) => {
      const save = () => {
        if (!isUpload) return postUserResponse({ taskId: task.id, userResponse })
        if (isDescriptionUpdate) return updateUploadDescription({ taskId: task.id, description: userResponse })
        if (!selectedFiles) return undefined

        return uploadDocuments({ taskId: task.id, files: selectedFiles, description: userResponse })
      }

      if (await save() === undefined) return

      form.reset({ userResponse })

      if (isDescriptionUpdate) return

      setSelectedFiles(undefined)
      onAnswered()
    },
  })

  return useMemo(() => ({
    form,
    isUpload,
    selectedFiles,
    setSelectedFiles,
    deleteUploads: () => deleteUploads({ taskId: task.id }),
    isDeletingUploads,
  }), [deleteUploads, form, isDeletingUploads, isUpload, selectedFiles, task.id])
}
