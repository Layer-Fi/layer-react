import { useContext } from 'react'
import { Container, Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { Loader } from '../Loader'
import { Heading, HeadingSize } from '../Typography'
import { IntegrationsContent } from './IntegrationsContent'
import { QuickbooksContextProvider } from '../../providers/QuickbooksContextProvider/QuickbooksContextProvider'
import { QuickbooksContext } from '../../contexts/QuickbooksContext/QuickbooksContext'
import { IntegrationsConnectMenu } from './IntegrationsConnectMenu/IntegrationsConnectMenu'

const COMPONENT_NAME = 'integrations'

export interface IntegrationsProps {
  elevated?: boolean
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
  elevated,
  stringOverrides,
}: IntegrationsProps) => {
  const { quickbooksIsConnected } = useContext(QuickbooksContext)
  const isLoading = quickbooksIsConnected === undefined

  return (
    <Container name={COMPONENT_NAME} elevated={elevated}>
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
      {!isLoading && !quickbooksIsConnected && (
        <DataState
          status={DataStateStatus.info}
          title='No active integrations'
        />
      )}
      {quickbooksIsConnected && <IntegrationsContent />}
    </Container>
  )
}
