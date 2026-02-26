import {
  type ColorConfig,
  type ColorHSLNumberConfig,
  type ColorRGBConfig,
  type ColorRGBNumberConfig,
  type ColorsPalette,
  type LayerThemeConfig,
} from '@internal-types/layer_context'
import { COLORS, SHADES } from '@config/theme'

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
    const textColor = parseTextColorFromTheme(theme.colors.text)
    styles = { ...styles, ...darkColor, ...lightColor, ...textColor }
  }

  return styles
}

const parseTextColorFromTheme = (color?: ColorConfig) => {
  if (!color) {
    return {}
  }

  try {
    if ('hex' in color) {
      return { '--text-color-primary': color.hex }
    }

    return {}
  }
  catch (_err) {
    return {}
  }
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
      return {
        [`--color-${colorName}-h`]: color.h,
        [`--color-${colorName}-s`]: color.s,
        [`--color-${colorName}-l`]: color.l,
      }
    }

    if ('r' in color && 'g' in color && 'b' in color) {
      const { h, s, l } = rgbToHsl(color)
      return {
        [`--color-${colorName}-h`]: h,
        [`--color-${colorName}-s`]: `${s}%`,
        [`--color-${colorName}-l`]: `${l}%`,
      }
    }

    if ('hex' in color) {
      const rgb = hexToRgb(color.hex)
      if (!rgb) {
        return {}
      }
      const { h, s, l } = rgbToHsl({
        r: rgb.r.toString(),
        g: rgb.g.toString(),
        b: rgb.b.toString(),
      })
      return {
        [`--color-${colorName}-h`]: h,
        [`--color-${colorName}-s`]: `${s}%`,
        [`--color-${colorName}-l`]: `${l}%`,
      }
    }

    return {}
  }
  catch (_err) {
    return {}
  }
}

/**
 * Parse the color from theme config into a CSS variables.
 * @param {string} colorName
 * @param {ColorConfig} color
 */
const parseColorFromThemeToHsl = (
  color?: ColorConfig,
): ColorHSLNumberConfig | undefined => {
  if (!color) {
    return
  }

  try {
    if ('h' in color && 's' in color && 'l' in color) {
      return {
        h: Number(color.h),
        s: Number(color.s),
        l: Number(color.l),
      }
    }

    if ('r' in color && 'g' in color && 'b' in color) {
      const { h, s, l } = rgbToHsl(color)
      return {
        h: h,
        s: s,
        l: l,
      }
    }

    if ('hex' in color) {
      const rgb = hexToRgb(color.hex)
      if (!rgb) {
        return undefined
      }
      const { h, s, l } = rgbToHsl({
        r: rgb.r.toString(),
        g: rgb.g.toString(),
        b: rgb.b.toString(),
      })
      return {
        h: h,
        s: s,
        l: l,
      }
    }

    return
  }
  catch (_err) {
    return
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
      (_m, r, g, b) => '#' + r + r + g + g + b + b,
    )
    .substring(1)
    .match(/.{2}/g)
    ?.map(x => parseInt(x, 16))

  if (!values) {
    return
  }

  const [r, g, b] = values
  if (r === undefined || g === undefined || b === undefined) {
    return
  }

  return { r, g, b }
}

/**
 * Build same color palette in RGB, HSL and HEX as CSS variables.
 */
export const buildColorsPalette = (theme?: LayerThemeConfig): ColorsPalette => {
  const darkColor = parseColorFromThemeToHsl(theme?.colors?.dark) ?? COLORS.dark
  const lightColor =
    parseColorFromThemeToHsl(theme?.colors?.light) ?? COLORS.light

  return {
    50: buildColorShade(50, darkColor),
    100: buildColorShade(100, darkColor),
    200: buildColorShade(200, darkColor),
    300: buildColorShade(300, darkColor),
    400: {
      hsl: lightColor,
      rgb: hslToRgb(lightColor),
      hex: hslToHex(lightColor),
    },
    500: buildColorShade(500, darkColor),
    600: buildColorShade(600, darkColor),
    700: buildColorShade(700, darkColor),
    800: buildColorShade(800, darkColor),
    900: {
      hsl: darkColor,
      rgb: hslToRgb(darkColor),
      hex: hslToHex(darkColor),
    },
    1000: buildColorShade(1000, darkColor),
  }
}

/**
 * Build color shade based on the dark color (HSL)
 * and config values for S and L.
 */
const buildColorShade = (
  shade: keyof typeof SHADES,
  darkColorHsl: ColorHSLNumberConfig,
) => {
  const hsl = { h: darkColorHsl.h, ...SHADES[shade] }
  const rgb = hslToRgb(hsl)
  const hex = hslToHex(hsl)

  return { hsl, rgb, hex }
}
/**
 * Convert Hue into RGB
 */
const hueToRgb = (p: number, q: number, t: number) => {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1.0 / 6.0) return p + (q - p) * 6 * t
  if (t < 1.0 / 2.0) return q
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6
  return p
}

/**
 * Convert HSL to RGB
 */
const hslToRgb = (hsl: ColorHSLNumberConfig): ColorRGBNumberConfig => {
  let r, g, b
  const l = hsl.l / 100
  const s = hsl.s / 100

  if (hsl.s === 0) {
    r = g = b = l
  }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hueToRgb(p, q, hsl.h + 1.0 / 3.0)
    g = hueToRgb(p, q, hsl.h)
    b = hueToRgb(p, q, hsl.h - 1.0 / 3.0)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

/**
 * Convert HSL to HEX
 */
const hslToHex = (hsl: ColorHSLNumberConfig): string => {
  const l = hsl.l / 100
  const s = hsl.s
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + hsl.h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
