// No imports on purpose: `api/package.json` marks this directory ESM because the root package is
// commonjs, and under ESM an extensionless relative import into `src/` wouldn't resolve at runtime.

// `tsconfig.json` restricts `types`, so Node's globals aren't declared here.
declare const process: { env: Record<string, string | undefined> }

const AUTH_URL = 'https://auth.layerfi.com/oauth2/token'

// Mirrors the non-production entries of `EnvironmentConfigs`.
const SCOPES: Record<string, string> = {
  sandbox: 'https://sandbox.layerfi.com/sandbox',
  staging: 'https://sandbox.layerfi.com/sandbox',
  internalStaging: 'https://sandbox.layerfi.com/sandbox',
}

const readRequiredEnv = (name: string) => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)

  return value
}

const fail = (message: string, status: number) => Response.json({ message }, { status })

const requestToken = (clientId: string, clientSecret: string, scope: string) =>
  fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${globalThis.btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope, client_id: clientId }),
  })

export async function POST() {
  const environment = readRequiredEnv('LAYER_ENVIRONMENT')
  const scope = SCOPES[environment]

  // Production is absent from SCOPES rather than special-cased, so it fails closed.
  if (!scope) return fail(`Refusing to mint a token for environment ${environment}`, 403)

  const response = await requestToken(
    readRequiredEnv('LAYER_APP_ID'),
    readRequiredEnv('LAYER_APP_SECRET'),
    scope,
  )

  if (!response.ok) {
    // Not forwarding the upstream body — it can echo request details back.
    return fail(`Token request failed: ${response.status}`, 502)
  }

  const { access_token: accessToken, expires_in: expiresIn } = await response.json() as {
    access_token?: string
    expires_in?: number
  }

  if (!accessToken || !expiresIn) return fail('Token response was missing fields', 502)

  return Response.json(
    { environment, accessToken, expiresIn },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
