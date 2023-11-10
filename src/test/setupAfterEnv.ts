import mockFetch from './mockFetch'

beforeAll(() => (global.fetch = jest.fn()))
beforeEach(() => {
  global.fetch = jest.fn()
  global.fetch.mockReset()
  global.fetch.mockImplementation(mockFetch)
})
