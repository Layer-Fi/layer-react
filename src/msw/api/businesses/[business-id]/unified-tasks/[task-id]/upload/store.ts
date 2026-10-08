import { createMockStore } from '@msw/utils/createMockStore'

export const unifiedTaskDocumentStore = createMockStore<{ id: string, documentIds: ReadonlyArray<string> }>(() => [])
