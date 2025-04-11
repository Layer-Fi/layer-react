import { IconSvgProps } from './types'
import { PiBank } from 'react-icons/pi'

const BankIcon = ({ size = 18, ...props }: IconSvgProps) => {
  return <PiBank size={size} {...props} />
}

export default BankIcon
