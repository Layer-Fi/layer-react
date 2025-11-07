import { Schema, pipe } from 'effect'
import { createTransformedEnumSchema } from '@schemas/utils'
import { S3PresignedUrlSchema } from '@schemas/common/s3PresignedUrl'

export enum BookkeepingPeriodStatus {
  BOOKKEEPING_NOT_ACTIVE = 'BOOKKEEPING_NOT_ACTIVE',
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS_AWAITING_BOOKKEEPER = 'IN_PROGRESS_AWAITING_BOOKKEEPER',
  IN_PROGRESS_AWAITING_CUSTOMER = 'IN_PROGRESS_AWAITING_CUSTOMER',
  CLOSING_IN_REVIEW = 'CLOSING_IN_REVIEW',
  CLOSED_OPEN_TASKS = 'CLOSED_OPEN_TASKS',
  CLOSED_COMPLETE = 'CLOSED_COMPLETE',
}

enum DocumentType {
  RECEIPT = 'RECEIPT',
  BANK_STATEMENT = 'BANK_STATEMENT',
  LOAN_STATEMENT = 'LOAN_STATEMENT',
  PAYROLL_STATEMENT = 'PAYROLL_STATEMENT',
  PAYOUT_STATEMENT = 'PAYOUT_STATEMENT',
  OTHER = 'OTHER',
}

enum TasksStatus {
  TODO = 'TODO',
  USER_MARKED_COMPLETED = 'USER_MARKED_COMPLETED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

enum TasksResponseType {
  FREE_RESPONSE = 'FREE_RESPONSE',
  UPLOAD_DOCUMENT = 'UPLOAD_DOCUMENT',
}

export enum BookkeepingPeriodScale {
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
  ONGOING = 'ONGOING',
}

const BookkeepingPeriodStatusSchema = Schema.Enums(BookkeepingPeriodStatus)
const DocumentTypeSchema = Schema.Enums(DocumentType)
const TasksStatusSchema = Schema.Enums(TasksStatus)
const TasksResponseTypeSchema = Schema.Enums(TasksResponseType)
const BookkeepingPeriodScaleSchema = Schema.Enums(BookkeepingPeriodScale)

const TransformedBookkeepingPeriodStatusSchema = createTransformedEnumSchema(
  BookkeepingPeriodStatusSchema,
  BookkeepingPeriodStatus,
  BookkeepingPeriodStatus.BOOKKEEPING_NOT_ACTIVE,
)

const TransformedDocumentTypeSchema = createTransformedEnumSchema(
  DocumentTypeSchema,
  DocumentType,
  DocumentType.OTHER,
)

const TransformedTasksStatusSchema = createTransformedEnumSchema(
  TasksStatusSchema,
  TasksStatus,
  TasksStatus.TODO,
)

const TransformedTasksResponseTypeSchema = createTransformedEnumSchema(
  TasksResponseTypeSchema,
  TasksResponseType,
  TasksResponseType.FREE_RESPONSE,
)

const DocumentSchema = Schema.Struct({
  documentType: pipe(
    Schema.propertySignature(TransformedDocumentTypeSchema),
    Schema.fromKey('document_type'),
  ),

  fileName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('file_name'),
  ),

  presignedUrl: pipe(
    Schema.propertySignature(S3PresignedUrlSchema),
    Schema.fromKey('presigned_url'),
  ),
})

const TaskSchema = Schema.Struct({
  id: Schema.UUID,

  question: Schema.String,

  status: TransformedTasksStatusSchema,

  title: Schema.String,

  transactionId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.UUID)),
    Schema.fromKey('transaction_id'),
  ),

  type: Schema.String,

  userMarkedCompletedAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Date)),
    Schema.fromKey('user_marked_completed_at'),
  ),

  userResponse: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('user_response'),
  ),

  userResponseType: pipe(
    Schema.propertySignature(TransformedTasksResponseTypeSchema),
    Schema.fromKey('user_response_type'),
  ),

  archivedAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Date)),
    Schema.fromKey('archived_at'),
  ),

  completedAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Date)),
    Schema.fromKey('completed_at'),
  ),

  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('created_at'),
  ),

  updatedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('updated_at'),
  ),

  effectiveDate: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('effective_date'),
  ),

  documentType: pipe(
    Schema.propertySignature(TransformedDocumentTypeSchema),
    Schema.fromKey('document_type'),
  ),

  documents: Schema.Array(DocumentSchema),
})

export type Task = typeof TaskSchema.Type

const BookkeepingPeriodSchema = Schema.Struct({
  id: Schema.UUID,
  month: Schema.Number.pipe(Schema.filter(n => n >= 0 && n <= 12)),
  year: Schema.Number.pipe(Schema.filter(n => n >= 0)),

  status: TransformedBookkeepingPeriodStatusSchema,

  scale: Schema.NullishOr(BookkeepingPeriodScaleSchema),

  tasks: Schema.Array(TaskSchema),
})

export type BookkeepingPeriod = typeof BookkeepingPeriodSchema.Type

export const ListBookkeepingPeriodsResponseSchema = Schema.Struct({
  data: Schema.Struct({
    periods: Schema.Array(BookkeepingPeriodSchema),
  }),
})

export type ListBookkeepingPeriodsResponse = typeof ListBookkeepingPeriodsResponseSchema.Type

