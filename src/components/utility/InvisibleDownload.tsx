import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

import { runDelayedSync } from '@utils/shared/delay/runDelayed'
import { type InvisibleDownloadHandle } from '@hooks/utils/download/useInvisibleDownload'

import './invisibleDownload.scss'

export { type InvisibleDownloadHandle, useInvisibleDownload } from '@hooks/utils/download/useInvisibleDownload'

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
