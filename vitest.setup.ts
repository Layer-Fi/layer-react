import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import '@testing-library/jest-dom/vitest'
import { server } from './src/msw/node'

const MSW_CONFIG = { onUnhandledRequest: 'error' as const }

beforeAll(() => server.listen(MSW_CONFIG))

afterEach(() => cleanup())
afterEach(() => server.resetHandlers())

afterAll(() => server.close())
