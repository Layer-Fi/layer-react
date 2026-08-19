import { Loader as LoaderIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'

import { ROTATING_CLASS_NAME } from '@utils/shared/styles/animationClassNames'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'

const legacyClassNames = createLegacyClassNames({
  Layer__UI__Loader: 'Layer__loader',
})

export const LOADER_CLASS_NAME = legacyClassNames('Layer__UI__Loader')

type LoaderProps = PropsWithChildren<{
  size?: number
}>

export const Loader = ({ children, size = 28 }: LoaderProps) => {
  return (
    <span className={LOADER_CLASS_NAME}>
      <LoaderIcon size={size} className={ROTATING_CLASS_NAME} />
      {children}
    </span>
  )
}
