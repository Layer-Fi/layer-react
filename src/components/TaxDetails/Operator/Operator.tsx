import { Span } from '@ui/Typography/Text'

import './operator.scss'

type OperatorProps = {
  sign: string | undefined
}

export const Operator = ({ sign }: OperatorProps) => {
  if (!sign) return null
  return <Span className='Layer__TaxDetails__Operator' size='lg' variant='subtle' aria-hidden='true'>{sign}</Span>
}
