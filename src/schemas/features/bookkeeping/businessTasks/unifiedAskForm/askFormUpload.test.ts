import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { AskFormUploadResultSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormUpload'

const decodeUpload = Schema.decodeUnknownSync(AskFormUploadResultSchema)

describe('AskFormUploadResultSchema', () => {
  it('decodes the documents an upload added', () => {
    expect(decodeUpload({
      type: 'Unified_Ask_Form_Upload',
      documents: [{ id: '00000000-0000-4000-8000-00000000d0c1', file_name: 'receipt.pdf' }],
    })).toEqual({ type: 'Unified_Ask_Form_Upload', documents: [{ id: '00000000-0000-4000-8000-00000000d0c1', fileName: 'receipt.pdf' }] })
  })

  it('encodes the type even when the decoded result omits it', () => {
    expect(Schema.encodeSync(AskFormUploadResultSchema)({ documents: [] })).toEqual({ type: 'Unified_Ask_Form_Upload', documents: [] })
  })

  it('rejects a document without an id', () => {
    expect(() => decodeUpload({ type: 'Unified_Ask_Form_Upload', documents: [{ file_name: 'receipt.pdf' }] })).toThrow()
  })
})
