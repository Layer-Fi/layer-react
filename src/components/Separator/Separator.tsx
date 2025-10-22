import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import { Spacing } from '../ui/sharedUITypes'
import './separator.scss'

type SeparatorProps = {
  mbs?: Spacing
  mbe?: Spacing
}

export const Separator = ({ mbs, mbe }: SeparatorProps) => {
  const dataProperties = toDataProperties({ mbs, mbe })

  return <div className='Layer__separator' {...dataProperties} />
}
