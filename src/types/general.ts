export type SortDirection = 'asc' | 'desc'

export interface BaseSelectOption {
  label: string
  value: string | number
}

export interface S3PresignedUrl {
  type: 'S3_Presigned_Url'
  presignedUrl: string
  fileType: string
}

export type LoadedStatus = 'initial' | 'loading' | 'complete'
