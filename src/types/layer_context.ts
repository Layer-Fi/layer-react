import { Category } from '../types'
import { ExpiringOAuthResponse } from './authentication'

export type LayerContextValues = {
  auth: ExpiringOAuthResponse
  businessId: string
  categories: Category[]
  apiUrl: string
  theme?: LayerThemeConfig
  colors: ColorsPalette
}

export type LayerContextHelpers = {
  getColor: (shade: number) => ColorsPaletteOption | undefined
}

export interface ColorHSLConfig {
  h: string
  s: string
  l: string
}

export interface ColorHSLNumberConfig {
  h: number
  s: number
  l: number
}

export interface ColorRGBConfig {
  r: string
  g: string
  b: string
}

export interface ColorRGBNumberConfig {
  r: number
  g: number
  b: number
}

export interface ColorHexConfig {
  hex: string
}

export type ColorConfig = ColorHSLConfig | ColorRGBConfig | ColorHexConfig

export interface ColorsPaletteOption {
  hsl: ColorHSLNumberConfig
  rgb: ColorRGBNumberConfig
  hex: string
}

export type ColorsPalette = Record<number, ColorsPaletteOption>

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
