import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import { Spacing } from '../ui/sharedUITypes'

type SeparatorProps = {
  mbs?: Spacing
  mbe?: Spacing
  direction?: 'horizontal' | 'vertical'
}

export const Separator = ({ mbs, mbe, direction = 'horizontal' }: SeparatorProps) => {
  const dataProperties = toDataProperties({ mbs, mbe, direction })

  return <div className='Layer__separator' {...dataProperties} />
}

export const VSeparator = ({ mbs, mbe }: SeparatorProps) => {
  return <Separator {...{ mbs, mbe, direction: 'vertical' }} />
}

export const HSeparator = ({ mbs, mbe }: SeparatorProps) => {
  return <Separator {...{ mbs, mbe, direction: 'horizontal' }} />
}
