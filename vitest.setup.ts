import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import '@testing-library/jest-dom/vitest'
import { server } from './src/msw/node'

const MSW_CONFIG = { onUnhandledRequest: 'error' as const }

const stubResizeObserver = () => {
  vi.stubGlobal('ResizeObserver', vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })))
}

beforeAll(() => stubResizeObserver())
beforeAll(() => server.listen(MSW_CONFIG))

afterEach(() => cleanup())
afterEach(() => server.resetHandlers())

afterAll(() => server.close())
