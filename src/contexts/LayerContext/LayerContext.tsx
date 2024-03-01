import { createContext } from 'react'
import { LayerContextValues } from '../../types'
import {
  LayerContextHelpers,
  LayerThemeConfig,
} from '../../types/layer_context'

export const LayerContext = createContext<
  LayerContextValues &
    LayerContextHelpers & { setTheme: (theme: LayerThemeConfig) => void }
>({
  auth: {
    access_token: '',
    expires_at: new Date(2000, 1, 1),
    expires_in: -1,
    token_type: '',
  },
  businessId: '',
  categories: [],
  apiUrl: '',
  theme: undefined,
  colors: {},
  setTheme: () => undefined,
  getColor: _shade => undefined,
})
