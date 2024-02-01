import { LayerThemeConfig, ColorConfig } from '../types/layer_context'

export const parseStylesFromThemeConfig = (theme?: LayerThemeConfig) => {
  let styles = {}
  if (!theme) {
    return styles
  }

  if (theme.colors) {
    const darkColor = parseColorFromTheme('dark', theme.colors.dark)
    const lightColor = parseColorFromTheme('light', theme.colors.light)
    styles = { ...styles, ...darkColor, ...lightColor }
  }

  return styles
}

const parseColorFromTheme = (colorName: string, color?: ColorConfig) => {
  if (!color) {
    return {}
  }

  if ('h' in color && 's' in color && 'l' in color) {
    console.log('its hsl')
    return {
      [`--color-${colorName}-h`]: color.h,
      [`--color-${colorName}-s`]: color.s,
      [`--color-${colorName}-l`]: color.l,
    }
  }

  // @TODO add support for HEX and RGB by converting to RGB and then to HSL

  return {}
}
