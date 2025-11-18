import type { PropsWithChildren } from 'react'

import type { LinkedAccount } from '@internal-types/linked_accounts'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import InstitutionIcon from '@icons/InstitutionIcon'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P } from '@ui/Typography/Text'

import './basicLinkedAccount.scss'

const CLASS_NAME = 'Layer__BasicLinkedAccountContainer'

type BasicLinkedAccountContainer = PropsWithChildren<{
  isSelected?: boolean
}>

export function BasicLinkedAccountContainer({ children, isSelected }: BasicLinkedAccountContainer) {
  const dataProperties = toDataProperties({ selected: isSelected })

  return (
    <div {...dataProperties} className={CLASS_NAME}>
      {children}
    </div>
  )
}

type BasicLinkedAccountLogoProps = {
  account: Pick<LinkedAccount, 'institution' | 'external_account_name'>
}

function BasicLinkedAccountLogo({ account }: BasicLinkedAccountLogoProps) {
  return (
    <VStack justify='center' className='Layer__BasicLinkedAccountLogo'>
      {account.institution?.logo
        ? (
          <img
            width={28}
            height={28}
            src={`data:image/png;base64,${account.institution.logo}`}
            alt={
              account.institution?.name
                ? account.institution?.name
                : account.external_account_name
            }
          />
        )
        : (
          <InstitutionIcon />
        )}
    </VStack>
  )
}

type BasicLinkedAccountContainerProps = {
  account: Pick<LinkedAccount, 'external_account_name' | 'mask' | 'institution'>
}

export function BasicLinkedAccountContent({ account }: BasicLinkedAccountContainerProps) {
  return (
    <HStack gap='md'>
      <BasicLinkedAccountLogo account={account} />
      <VStack>
        <Heading level={3} size='xs' pbe='3xs'>{account.external_account_name}</Heading>
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
