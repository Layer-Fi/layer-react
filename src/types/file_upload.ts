export interface FileMetadata {
  type: 'File_Metadata'
  id: string | null
  fileType: string
  fileName: string
  documentType: DocumentType
}

export type DocumentType =
  | 'RECEIPT'
  | 'BANK_STATEMENT'
  | 'LOAN_STATEMENT'
  | 'PAYROLL_STATEMENT'
  | 'PAYOUT_STATEMENT'
  | 'OTHER'
