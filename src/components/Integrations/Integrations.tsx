import { Heading, HeadingSize } from '@components/Typography/Heading'
import { useContext } from 'react'
import { Container } from '@components/Container/Container'
import { Header } from '@components/Container/Header'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { IntegrationsContent } from '@components/Integrations/IntegrationsContent'
import { QuickbooksContextProvider } from '@providers/QuickbooksContextProvider/QuickbooksContextProvider'
import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'
import { IntegrationsConnectMenu } from '@components/Integrations/IntegrationsConnectMenu/IntegrationsConnectMenu'

const COMPONENT_NAME = 'integrations'

export interface IntegrationsProps {
  stringOverrides?: {
    title?: string
  }
}

export const Integrations = (props: IntegrationsProps) => {
  return (
    <QuickbooksContextProvider>
      <IntegrationsComponent {...props} />
    </QuickbooksContextProvider>
  )
}

export const IntegrationsComponent = ({
  stringOverrides,
}: IntegrationsProps) => {
  const { quickbooksConnectionStatus } = useContext(QuickbooksContext)
  const isLoading = quickbooksConnectionStatus === undefined

  return (
    <Container name={COMPONENT_NAME}>
      <Header className='Layer__linked-accounts__header'>
        <Heading
          className='Layer__linked-accounts__title'
          size={HeadingSize.secondary}
        >
          {stringOverrides?.title || 'Integrations'}
        </Heading>
        <IntegrationsConnectMenu />
      </Header>
      {isLoading && (
        <div className='Layer__linked-accounts__loader-container'>
          <Loader />
        </div>
      )}
      {!isLoading && !quickbooksConnectionStatus.is_connected && (
        <DataState
          status={DataStateStatus.info}
          title='No active integrations'
        />
      )}
      {quickbooksConnectionStatus?.is_connected && <IntegrationsContent />}
    </Container>
  )
}
