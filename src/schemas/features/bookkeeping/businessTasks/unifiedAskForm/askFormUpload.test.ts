import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { AskFormUploadResultSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormUpload'

const decodeUpload = Schema.decodeUnknownSync(AskFormUploadResultSchema)

describe('AskFormUploadResultSchema', () => {
  it('decodes the documents an upload added', () => {
    expect(decodeUpload({
      type: 'Unified_Ask_Form_Upload',
      documents: [{ id: '00000000-0000-4000-8000-00000000d0c1', file_name: 'receipt.pdf' }],
    })).toEqual({ documents: [{ id: '00000000-0000-4000-8000-00000000d0c1', fileName: 'receipt.pdf' }] })
  })

  it('rejects a document without an id', () => {
    expect(() => decodeUpload({ documents: [{ file_name: 'receipt.pdf' }] })).toThrow()
  })
})
