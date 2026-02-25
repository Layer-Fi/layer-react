import { type Business } from '@internal-types/business'
import { type DateRange } from '@internal-types/general'
import { type DataModel } from '@internal-types/general'
import { type AccountingConfigurationSchemaType } from '@schemas/accountingConfiguration'
import { type LayerError } from '@models/ErrorHandler'
import { type EnvironmentConfig } from '@providers/Environment/environmentConfigs'
import type { EventCallbacks } from '@providers/LayerProvider/LayerProvider'
import { type ToastProps } from '@components/Toast/Toast'

export type LayerContextValues = {
  environment?: Pick<EnvironmentConfig, 'environment' | 'apiUrl' | 'authUrl' | 'scope'>
  businessId: string
  business?: Business
  theme?: LayerThemeConfig
  colors: ColorsPalette
  onboardingStep?: OnboardingStep
  toasts: (ToastProps & { isExiting: boolean })[]
  eventCallbacks?: EventCallbacks
  accountingConfiguration?: AccountingConfigurationSchemaType
}

export type LayerContextDateRange = {
  dateRange: {
    range: DateRange
    setRange: (dateRange: DateRange) => DateRange
  }
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
  read: (model: DataModel, cacheKey: string) => void
  syncTimestamps: Partial<Record<DataModel, number>>
  readTimestamps: Partial<Record<string, { t: number, m: DataModel }>>
  expireDataCaches: () => void
  hasBeenTouched: (cacheKey: string) => boolean
  setTheme: (theme: LayerThemeConfig) => void
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
  setBusiness = 'LayerContext.setBusiness',
  setTheme = 'LayerContext.setTheme',
  setOnboardingStep = 'LayerContext.setOnboardingStep',
  setColors = 'LayerContext.setColors',
  setToast = 'LayerContext.setToast',
  removeToast = 'LayerContext.removeToast',
  setToastExit = 'LayerContext.setToastExit',
}

export type LayerContextAction =
  | {
    type: LayerContextActionName.setBusiness
    payload: { business: LayerContextValues['business'] }
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
