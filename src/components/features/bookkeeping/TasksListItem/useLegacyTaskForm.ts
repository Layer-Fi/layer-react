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

  const form = useAppForm<LegacyTaskFormValues>({
    defaultValues: { userResponse: task.userResponse ?? '' },
    onSubmit: async ({ value }) => {
      if (!isUpload) {
        const saved = await postUserResponse({ taskId: task.id, userResponse: value.userResponse })

        if (saved === undefined) return

        form.reset(value)
        onAnswered()
        return
      }

      if (task.status === BusinessTaskStatus.Todo) {
        if (!selectedFiles) return

        const saved = await uploadDocuments({ taskId: task.id, files: selectedFiles, description: value.userResponse })

        if (saved === undefined) return

        form.reset(value)
        setSelectedFiles(undefined)
        onAnswered()
        return
      }

      const saved = await updateUploadDescription({ taskId: task.id, description: value.userResponse })

      if (saved !== undefined) form.reset(value)
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
