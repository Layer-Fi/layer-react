import { ToastProps } from '../components/Toast/Toast'
import { LayerError } from '../models/ErrorHandler'
import { EventCallbacks } from '../providers/LayerProvider/LayerProvider'
import { Business, Category } from '../types'
import { ExpiringOAuthResponse } from './authentication'
import { DataModel } from './general'

export type LayerContextValues = {
  auth: ExpiringOAuthResponse
  businessId: string
  business?: Business
  categories: Category[]
  apiUrl: string
  theme?: LayerThemeConfig
  colors: ColorsPalette
  usePlaidSandbox?: boolean
  onboardingStep?: OnboardingStep
  environment: string
  toasts: (ToastProps & { isExiting: boolean })[]
  eventCallbacks?: EventCallbacks
}

export type LayerContextHelpers = {
  getColor: (shade: number) => ColorsPaletteOption | undefined
  setLightColor: (color?: ColorConfig) => void
  setDarkColor: (color?: ColorConfig) => void
  setTextColor: (color?: ColorConfig) => void
  setColors: (colors?: LayerThemeConfigColors) => void
  setOnboardingStep: (value: OnboardingStep) => void
  addToast: (toast: ToastProps) => void
  removeToast: (toast: ToastProps) => void
  onError?: (error: LayerError) => void
  touch: (model: DataModel) => void
  read: (model: DataModel) => void
  syncTimestamps: Partial<Record<DataModel, number>>
  readTimestamps: Partial<Record<DataModel, number>>
  hasBeenTouched: (model: DataModel) => boolean
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
  text?: ColorConfig
}

export interface LayerThemeConfig {
  colors?: LayerThemeConfigColors
}

export type OnboardingStep = undefined | 'connectAccount' | 'complete'

export enum LayerContextActionName {
  setAuth = 'LayerContext.setAuth',
  setBusiness = 'LayerContext.setBusiness',
  setCategories = 'LayerContext.setCategories',
  setTheme = 'LayerContext.setTheme',
  setOnboardingStep = 'LayerContext.setOnboardingStep',
  setColors = 'LayerContext.setColors',
  setToast = 'LayerContext.setToast',
  removeToast = 'LayerContext.removeToast',
  setToastExit = 'LayerContext.setToastExit',
}

export type LayerContextAction =
  | {
      type: LayerContextActionName.setAuth
      payload: { auth: LayerContextValues['auth'] }
    }
  | {
      type: LayerContextActionName.setBusiness
      payload: { business: LayerContextValues['business'] }
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
  | {
      type: LayerContextActionName.setColors
      payload: { colors: LayerContextValues['colors'] }
    }
  | {
      type: LayerContextActionName.setToast
      payload: { toast: ToastProps }
    }
  | {
      type: LayerContextActionName.removeToast
      payload: { toast: ToastProps }
    }
  | {
      type: LayerContextActionName.setToastExit
      payload: { toast: ToastProps }
    }
