const mockFetch = jest
  .fn()
  .mockImplementation((url: string, config: Record<string, string>) =>
    Promise.resolve({ json: () => Promise.resolve({ url, config }) }),
  )

export default mockFetch
