import { type S3PresignedUrl } from '@internal-types/general'

export const formatCsvCents = (cents: number) => (cents / 100).toFixed(2)

export const formatCsvDate = (date: Date) => date.toISOString().slice(0, 10)

const escapeCsvField = (field: string) =>
  /[",\n]/.test(field) ? `"${field.replaceAll('"', '""')}"` : field

const toCsvDataUrl = (rows: ReadonlyArray<readonly string[]>) =>
  `data:text/csv;charset=utf-8,${encodeURIComponent(rows.map(row => row.map(escapeCsvField).join(',')).join('\n'))}`

export const csvPresignedUrlResponse = (
  fileName: string,
  rows: ReadonlyArray<readonly string[]>,
): { data: S3PresignedUrl } => ({
  data: {
    type: 'S3_Presigned_Url',
    presignedUrl: toCsvDataUrl(rows),
    fileType: 'text/csv',
    fileName,
    createdAt: new Date().toISOString(),
  },
})
