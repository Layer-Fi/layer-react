export type OAuthResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type LayerExecutionContext = {
  auth: OAuthResponse | undefined
  businessId: string
}
