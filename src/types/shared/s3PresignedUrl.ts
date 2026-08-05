export interface S3PresignedUrl {
  type: 'S3_Presigned_Url'
  presignedUrl: string
  fileType: string
  fileName: string
  createdAt: string
  documentId?: string
}
