import { Category } from '../types'
import { ExpiringOAuthResponse } from './authentication'

export type LayerContextValues = {
  auth: ExpiringOAuthResponse
  businessId: string
  categories: Category[]
  apiUrl: string
  theme?: LayerThemeConfig
}

export interface ColorHSLConfig {
  h: string
  s: string
  l: string
}

export interface ColorRGBConfig {
  r: string
  g: string
  b: string
}

export interface ColorHexConfig {
  hex: string
}

export type ColorConfig = ColorHSLConfig | ColorRGBConfig | ColorHexConfig

export interface LayerThemeConfig {
  colors?: {
    dark?: ColorConfig
    light?: ColorConfig
  }
}

export enum LayerContextActionName {
  setAuth = 'LayerContext.setAuth',
  setCategories = 'LayerContext.setCategories',
  setTheme = 'LayerContext.setTheme',
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
  | {
      type: LayerContextActionName.setTheme
      payload: { theme: LayerContextValues['theme'] }
    }
