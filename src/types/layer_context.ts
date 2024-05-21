import { Category } from '../types'
import { ExpiringOAuthResponse } from './authentication'

export type LayerContextValues = {
  auth: ExpiringOAuthResponse
  businessId: string
  categories: Category[]
  apiUrl: string
  theme?: LayerThemeConfig
  colors: ColorsPalette
  usePlaidSandbox?: boolean
  onboardingStep?: OnboardingStep
  environment: string
}

export type LayerContextHelpers = {
  getColor: (shade: number) => ColorsPaletteOption | undefined
  setLightColor: (color?: ColorConfig) => void
  setDarkColor: (color?: ColorConfig) => void
  setColors: (colors?: LayerThemeConfigColors) => void
  setOnboardingStep: (value: OnboardingStep) => void
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

export interface LayerThemeConfigColors {
  dark?: ColorConfig
  light?: ColorConfig
}

export interface LayerThemeConfig {
  colors?: LayerThemeConfigColors
}

export type OnboardingStep = undefined | 'connectAccount' | 'complete'

export enum LayerContextActionName {
  setAuth = 'LayerContext.setAuth',
  setCategories = 'LayerContext.setCategories',
  setTheme = 'LayerContext.setTheme',
  setOnboardingStep = 'LayerContext.setOnboardingStep',
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
  | {
      type: LayerContextActionName.setOnboardingStep
      payload: { onboardingStep: LayerContextValues['onboardingStep'] }
    }
