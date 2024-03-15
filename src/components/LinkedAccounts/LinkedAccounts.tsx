import React from 'react'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import { Container, Header } from '../Container'
import { Heading, HeadingSize } from '../Typography'
import { LinkedAccountThumb } from './LinkedAccountThumb'

const COMPONENT_NAME = 'linked-accounts'

export const LinkedAccounts = () => {
  const { data, isLoading, error, isValidating } = useLinkedAccounts()

  return (
    <Container name={COMPONENT_NAME}>
      <Header className='Layer__linked-accounts__header'>
        <Heading
          className='Layer__linked-accounts__title'
          size={HeadingSize.secondary}
        >
          Linked Accounts
        </Heading>
      </Header>
      <div className='Layer__linked-accounts__list'>
        {data?.map((account, index) => (
          <LinkedAccountThumb account={account} key={`linked-acc-${index}`} />
        ))}
      </div>
    </Container>
  )
}
