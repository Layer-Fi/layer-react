import { type AccountingConfigurationSchemaType } from '@schemas/accountingConfiguration'
import { type Business } from '@schemas/business'
import { type LayerError } from '@utils/api/errorHandler'
import type { EventCallbacks } from '@providers/LayerProvider/LayerProvider'
import { type ToastProps } from '@components/Toast/Toast'

export type LayerContextValues = {
  businessId: string
  business?: Business
  theme?: LayerThemeConfig
  colors: ColorsPalette
  /** @deprecated No longer used; the Onboarding component that consumed this has been removed. */
  onboardingStep?: OnboardingStep
  toasts: (ToastProps & { isExiting: boolean })[]
  eventCallbacks?: EventCallbacks
  accountingConfiguration?: AccountingConfigurationSchemaType
}

export type LayerContextHelpers = {
  getColor: (shade: number) => ColorsPaletteOption | undefined
  setLightColor: (color?: ColorConfig) => void
  setDarkColor: (color?: ColorConfig) => void
  setTextColor: (color?: ColorConfig) => void
  setColors: (colors?: LayerThemeConfigColors) => void
  /** @deprecated No longer used; the Onboarding component that consumed this has been removed. */
  setOnboardingStep: (value: OnboardingStep) => void
  addToast: (toast: ToastProps) => void
  removeToast: (toast: ToastProps) => void
  onError?: (error: LayerError) => void
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

/** @deprecated No longer used; the Onboarding component that consumed this has been removed. */
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
