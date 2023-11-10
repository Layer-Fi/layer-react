export default (url: string, config: Record<string, string>) =>
  Promise.resolve({ json: () => Promise.resolve({ url, config }) })
