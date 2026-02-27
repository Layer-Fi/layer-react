export type Environment = 'production' | 'sandbox' | 'staging' | 'internalStaging'

export type EnvironmentConfig = {
  environment: Environment
  apiUrl: string
  authUrl: string
  scope: string
  usePlaidSandbox: boolean
}

export type EnvironmentConfigOverride = Omit<EnvironmentConfig, 'usePlaidSandbox'>

export const EnvironmentConfigs = {
  production: {
    environment: 'production',
    apiUrl: 'https://api.layerfi.com',
    authUrl: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://api.layerfi.com/production',
    usePlaidSandbox: false,
  },
  sandbox: {
    environment: 'sandbox',
    apiUrl: 'https://sandbox.layerfi.com',
    authUrl: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    usePlaidSandbox: true,
  },
  staging: {
    environment: 'staging',
    apiUrl: 'https://staging.layerfi.com',
    authUrl: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    usePlaidSandbox: true,
  },
  internalStaging: {
    environment: 'internalStaging',
    apiUrl: 'https://staging.layerfi.com',
    authUrl: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    usePlaidSandbox: true,
  },
} as const satisfies Record<Environment, EnvironmentConfig>
