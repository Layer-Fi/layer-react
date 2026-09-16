import { type ReactNode } from 'react'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'

import './iconBox.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__IconBox: 'Layer__icon-box',
})

interface IconBoxProps {
  children: ReactNode
}

export const IconBox = ({ children }: IconBoxProps) => {
  return <span className={legacyClassNames('Layer__IconBox')}>{children}</span>
}
