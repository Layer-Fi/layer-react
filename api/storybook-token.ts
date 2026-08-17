// Vercel function. Mints a short-lived business access token so the Layer app secret never reaches
// the browser. Excluded from the npm package by `files: ["/dist"]`.
import { type Environment, EnvironmentConfigs } from '../src/providers/global/Environment/environmentConfigs'

// `tsconfig.json` restricts `types`, so Node's globals aren't declared here.
declare const process: { env: Record<string, string | undefined> }

const readRequiredEnv = (name: string) => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)

  return value
}

const fail = (message: string, status: number) => Response.json({ message }, { status })

export async function POST() {
  const environment = readRequiredEnv('LAYER_STORYBOOK_ENVIRONMENT')

  // Returned to the client rather than configured there too, so the provider's `environment` can't
  // drift from the scope this token was minted for.
  if (!(environment in EnvironmentConfigs)) return fail(`Unknown environment ${environment}`, 409)
  if (environment === 'production' || environment === 'production-ca') {
    return fail('Refusing to mint a production token', 403)
  }

  const { authUrl, scope } = EnvironmentConfigs[environment as Environment]
  const clientId = readRequiredEnv('LAYER_STORYBOOK_APP_ID')
  const clientSecret = readRequiredEnv('LAYER_STORYBOOK_APP_SECRET')

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${globalThis.btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope, client_id: clientId }),
  })

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
