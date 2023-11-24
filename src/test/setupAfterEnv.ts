import mockFetch from './mockFetch'
import '@testing-library/jest-dom'

beforeAll(() => (global.fetch = jest.fn()))
beforeEach(() => {
  global.fetch = jest.fn()
  global.fetch.mockReset()
  global.fetch.mockImplementation(mockFetch)
})
