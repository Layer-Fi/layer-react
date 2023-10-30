import { createContext } from 'react'
import { OAuthResponse } from '../../types'

export const LayerContext = createContext<OAuthResponse>({
  access_token: '',
  token_type: '',
  expires_in: -1,
})
