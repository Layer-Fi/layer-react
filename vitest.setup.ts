import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import '@testing-library/jest-dom/vitest'
import { server } from './test/msw/node'

beforeAll(() => server.listen())

afterEach(() => cleanup())
afterEach(() => server.resetHandlers())

afterAll(() => server.close())
