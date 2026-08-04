import { Landmark } from 'lucide-react'
import type { PropsWithChildren } from 'react'

import type { ExternalAccountConnection } from '@schemas/bankAccounts/externalAccountConnection'
import { toDataProperties } from '@utils/shared/styleUtils/toDataProperties'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P } from '@ui/Typography/Text'

import './linkedAccountRow.scss'

const CLASS_NAME = 'Layer__LinkedAccountRow'

type LinkedAccountRowContainerProps = PropsWithChildren<{
  isSelected?: boolean
}>

export function LinkedAccountRowContainer({ children, isSelected }: LinkedAccountRowContainerProps) {
  const dataProperties = toDataProperties({ selected: isSelected })

  return (
    <div {...dataProperties} className={CLASS_NAME}>
      {children}
    </div>
  )
}

type LinkedAccountRowLogoProps = {
  account: Pick<ExternalAccountConnection, 'institution' | 'externalAccountName'>
}

function LinkedAccountRowLogo({ account }: LinkedAccountRowLogoProps) {
  return (
    <VStack justify='center' className='Layer__LinkedAccountRow__Logo'>
      {account.institution?.logo
        ? (
          <img
            width={28}
            height={28}
            src={`data:image/png;base64,${account.institution.logo}`}
            alt={
              account.institution?.name
                ? account.institution?.name
                : account.externalAccountName
            }
          />
        )
        : (
          <Landmark size={18} />
        )}
    </VStack>
  )
}

type LinkedAccountRowContentProps = {
  account: Pick<ExternalAccountConnection, 'externalAccountName' | 'mask' | 'institution'>
}

export function LinkedAccountRowContent({ account }: LinkedAccountRowContentProps) {
  return (
    <HStack gap='md'>
      <LinkedAccountRowLogo account={account} />
      <VStack>
        <Heading level={4} size='xs' pbe='3xs'>{account.externalAccountName}</Heading>
        <HStack gap='xs'>
          <P size='sm'>
            {account.institution?.name}
          </P>
          <P variant='subtle' size='sm'>
            •••
            {' '}
            {account.mask}
          </P>
        </HStack>
      </VStack>
    </HStack>
  )
}
