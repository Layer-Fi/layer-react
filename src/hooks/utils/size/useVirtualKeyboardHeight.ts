import { useEffect, useState } from 'react'

const KEYBOARD_HEIGHT_THRESHOLD = 150

/**
 * Detects virtual keyboard visibility on mobile devices using the Visual Viewport API.
 *
 * When the virtual keyboard opens, the visual viewport shrinks while window.innerHeight
 * stays the same. The difference between them gives us the keyboard height.
 */
export const useVirtualKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const viewport = window.visualViewport

    if (!viewport) return

    const handleResize = () => {
      const heightDifference = window.innerHeight - viewport.height

      const nextKeyboardHeight = heightDifference > KEYBOARD_HEIGHT_THRESHOLD ? heightDifference : 0

      setKeyboardHeight(nextKeyboardHeight)
    }

    viewport.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      viewport.removeEventListener('resize', handleResize)
    }
  }, [])

  return keyboardHeight
}
