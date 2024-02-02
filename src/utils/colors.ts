import {
  LayerThemeConfig,
  ColorConfig,
  ColorRGBConfig,
} from '../types/layer_context'

/**
 * Convert `theme` config set in Provider into component styles.
 *
 * @param {LayerThemeConfig} theme - the theme set with provider
 */
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

/**
 * Parse the color from theme config into a CSS variables.
 * @param {string} colorName
 * @param {ColorConfig} color
 */
const parseColorFromTheme = (colorName: string, color?: ColorConfig) => {
  if (!color) {
    return {}
  }

  try {
    if ('h' in color && 's' in color && 'l' in color) {
      console.log('its hsl', color)
      return {
        [`--color-${colorName}-h`]: color.h,
        [`--color-${colorName}-s`]: color.s,
        [`--color-${colorName}-l`]: color.l,
      }
    }

    if ('r' in color && 'g' in color && 'b' in color) {
      const { h, s, l } = rgbToHsl(color)
      console.log('its rgb', h, s, l)
      return {
        [`--color-${colorName}-h`]: h,
        [`--color-${colorName}-s`]: `${s}%`,
        [`--color-${colorName}-l`]: `${l}%`,
      }
    }

    if ('hex' in color) {
      console.log('its hex')
      const rgb = hexToRgb(color.hex)
      if (!rgb) {
        return {}
      }
      const { h, s, l } = rgbToHsl({
        r: rgb.r.toString(),
        g: rgb.g.toString(),
        b: rgb.b.toString(),
      })
      console.log('its hex', h, s, l)
      return {
        [`--color-${colorName}-h`]: h,
        [`--color-${colorName}-s`]: `${s}%`,
        [`--color-${colorName}-l`]: `${l}%`,
      }
    }

    return {}
  } catch (_err) {
    return {}
  }
}

/**
 * Convert RGB to HSL
 */
const rgbToHsl = (color: ColorRGBConfig) => {
  let r = Number(color.r)
  let g = Number(color.g)
  let b = Number(color.b)
  r /= 255
  g /= 255
  b /= 255
  const l = Math.max(r, g, b)
  const s = l - Math.min(r, g, b)
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0
  return {
    h: 60 * h < 0 ? 60 * h + 360 : 60 * h,
    s: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    l: (100 * (2 * l - s)) / 2,
  }
}

/**
 * Convert HEX to RGB
 */
const hexToRgb = (hex: string) => {
  const values = hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => '#' + r + r + g + g + b + b,
    )
    .substring(1)
    .match(/.{2}/g)
    ?.map(x => parseInt(x, 16))

  if (!values) {
    return
  }

  return {
    r: values[0],
    g: values[1],
    b: values[2],
  }
}
