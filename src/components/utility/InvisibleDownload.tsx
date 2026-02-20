import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

import { runDelayedSync } from '@utils/delay/runDelayed'

import './invisibleDownload.scss'

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

const CLASS_NAME = 'Layer__InvisibleDownload'

const InvisibleDownload = forwardRef<InvisibleDownloadHandle>((_props, ref) => {
  const internalRef = useRef<HTMLAnchorElement>(null)

  useImperativeHandle(ref, () => ({
    trigger: async ({ url, filename }) => {
      internalRef.current?.setAttribute('href', url)
      if (filename) {
        internalRef.current?.setAttribute('download', filename)
      }

      return runDelayedSync(() => internalRef.current?.click())
    },
  }))

  const handleContainClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation()
  }, [])

  return <a download className={CLASS_NAME} ref={internalRef} onClick={handleContainClick} />
})
InvisibleDownload.displayName = 'InvisibleDownload'

export default InvisibleDownload
