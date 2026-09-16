/// <reference types="vite/client" />

export const usesRealBackend = import.meta.env.STORYBOOK_LAYER_BACKEND === 'real'

export const getTokenEndpoint = () => {
  const value: unknown = import.meta.env.STORYBOOK_LAYER_TOKEN_ENDPOINT

  if (typeof value !== 'string' || !value) throw new Error('Missing STORYBOOK_LAYER_TOKEN_ENDPOINT')

  return value
}
