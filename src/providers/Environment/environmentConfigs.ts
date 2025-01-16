export type Environment = 'production' | 'sandbox' | 'staging' | 'internalStaging'

type EnvironmentConfig = {
  apiUrl: string
  authUrl: string
  scope: string
  usePlaidSandbox: boolean
}

export const EnvironmentConfigs = {
  production: {
    apiUrl: 'https://api.layerfi.com',
    authUrl: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://api.layerfi.com/production',
    usePlaidSandbox: false,
  },
  sandbox: {
    apiUrl: 'https://sandbox.layerfi.com',
    authUrl: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    usePlaidSandbox: true,
  },
  staging: {
    apiUrl: 'https://staging.layerfi.com',
    authUrl: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    usePlaidSandbox: true,
  },
  internalStaging: {
    apiUrl: 'https://staging.layerfi.com',
    authUrl: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    usePlaidSandbox: true,
  },
} as const satisfies Record<Environment, EnvironmentConfig>
