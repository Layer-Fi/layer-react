import { useContext } from 'react'
import { IntegrationsQuickbooksItemThumb } from './IntegrationsQuickbooksItemThumb/IntegrationsQuickbooksItemThumb'
import { QuickbooksContext } from '../../contexts/QuickbooksContext/QuickbooksContext'

export const IntegrationsContent = () => {
  const { quickbooksIsConnected } = useContext(QuickbooksContext)

  return (
    <div className='Layer__linked-accounts__list'>
      {quickbooksIsConnected && <IntegrationsQuickbooksItemThumb />}
    </div>
  )
}
