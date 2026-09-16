import { useCallback, useRef } from 'react'

// Split from the InvisibleDownload component so callers can wire up a download
// without depending on the element that performs it.

export type InvisibleDownloadHandle = {
  trigger: (options: { url: string, filename?: string }) => Promise<void>
}

export function useInvisibleDownload() {
  const invisibleDownloadRef = useRef<InvisibleDownloadHandle>(null)

  const triggerInvisibleDownload = useCallback((options: { url: string, filename?: string }) => {
    void invisibleDownloadRef.current?.trigger(options)
  }, [])

  return { invisibleDownloadRef, triggerInvisibleDownload }
}
