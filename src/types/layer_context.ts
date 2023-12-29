import { Category } from '../types'
import { ExpiringOAuthResponse } from './authentication'

export type LayerContextValues = {
  auth: ExpiringOAuthResponse
  businessId: string
  categories: Category[]
}

export enum LayerContextActionName {
  setAuth = 'LayerContext.setAuth',
  setCategories = 'LayerContext.setCategories',
}

export type LayerContextAction =
  | {
      type: LayerContextActionName.setAuth
      payload: { auth: LayerContextValues['auth'] }
    }
  | {
      type: LayerContextActionName.setCategories
      payload: { categories: LayerContextValues['categories'] }
    }
