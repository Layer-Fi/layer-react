import { useSizeClass } from './useWindowSize'

function isTouchOnlyDevice() {
  const hasTouchCapability = (
    'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || ('msMaxTouchPoints' in navigator && navigator.msMaxTouchPoints !== undefined && (navigator.msMaxTouchPoints as number) > 0)
  )

  const hasCoarsePointerOnly = window.matchMedia('(pointer: coarse) and (hover: none)').matches

  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // A device is likely touch-only if it has touch capability AND
  // either has only coarse pointer or is identified as mobile
  return hasTouchCapability && (hasCoarsePointerOnly || mobileUserAgent)
}

function isHighResolutionDisplay() {
  if (window.devicePixelRatio) {
    return window.devicePixelRatio >= 2
  }

  // Fallback for older browsers
  if (window.matchMedia) {
    const mq = window.matchMedia('(resolution >= 2dppx), (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)')
    return mq.matches
  }

  return false
}

export function useMobileExperience() {
  const { isMobile, isTablet } = useSizeClass()

  const isHighResolution = isHighResolutionDisplay()

  return isMobile || isTablet || isHighResolution || isTouchOnlyDevice()
}
