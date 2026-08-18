import classNames from 'classnames'
import { Loader } from 'lucide-react'

import { ROTATING_CLASS_NAME } from '@utils/shared/styles/animationClassNames'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { LOADER_CLASS_NAME } from '@ui/Loader/Loader'

import './smallLoader.scss'

const legacyClassNames = createLegacyClassNames({
  'data:withBg': 'Layer__loader--with-bg',
})

export interface SmallLoaderProps {
  size?: number
}

export const SmallLoader = ({ size = 28 }: SmallLoaderProps) => {
  return (
    <span
      className={classNames(LOADER_CLASS_NAME, legacyClassNames('data:withBg'))}
      data-with-bg
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <Loader className={ROTATING_CLASS_NAME} size={size - 16} />
    </span>
  )
}
