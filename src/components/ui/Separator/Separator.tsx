import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { type Spacing } from '@ui/sharedUITypes'

import './separator.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__UI__Separator: 'Layer__separator',
})

type SeparatorProps = {
  mbs?: Spacing
  mbe?: Spacing
}

export const Separator = ({ mbs, mbe }: SeparatorProps) => {
  const dataProperties = toDataProperties({ mbs, mbe })

  return <div className={legacyClassNames('Layer__UI__Separator')} {...dataProperties} />
}
