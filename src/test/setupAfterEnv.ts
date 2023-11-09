import mockFetch from './mockFetch.ts'

beforeAll(() => (global.fetch = jest.fn()))
beforeEach(() => {
  global.fetch.mockReset()
  global.fetch.mockImplementation(mockFetch)
})
