export type OAuthResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type ExpiringOAuthResponse = OAuthResponse & {
  expires_at: Date
}
