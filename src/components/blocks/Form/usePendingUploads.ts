import { useState } from 'react'

import { type UploadedFile } from '@blocks/Form/types'

export type UploadFiles = (files: ReadonlyArray<File>) => Promise<ReadonlyArray<UploadedFile> | null>

export type PendingFile = { key: string, file: File }

const withSizes = (uploaded: ReadonlyArray<UploadedFile>, files: ReadonlyArray<File>) => {
  const sizeByName = new Map(files.map(({ name, size }) => [name, size]))
  return uploaded.map(stored => ({ sizeInBytes: sizeByName.get(stored.name), ...stored }))
}

export const usePendingUploads = (upload: UploadFiles) => {
  const [pending, setPending] = useState<ReadonlyArray<PendingFile>>([])

  /** Resolves with the stored files, carrying the sizes of the ones sent, or null when the upload failed. */
  const startUpload = async (files: ReadonlyArray<File>) => {
    const batch: ReadonlyArray<PendingFile> = files.map(file => ({ key: crypto.randomUUID(), file }))
    const keys = new Set(batch.map(({ key }) => key))

    setPending(current => [...current, ...batch])
    const uploaded = await upload(files).catch(() => null)
    setPending(current => current.filter(({ key }) => !keys.has(key)))

    return uploaded && withSizes(uploaded, files)
  }

  return { pending, startUpload }
}
