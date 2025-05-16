import { useContext } from 'react'
import { IntegrationsQuickbooksItemThumb } from './IntegrationsQuickbooksItemThumb/IntegrationsQuickbooksItemThumb'
import { QuickbooksContext } from '../../contexts/QuickbooksContext/QuickbooksContext'

export const IntegrationsContent = () => {
  const { quickbooksConnectionStatus } = useContext(QuickbooksContext)

  return (
    <div className='Layer__linked-accounts__list'>
      {quickbooksConnectionStatus?.is_connected && <IntegrationsQuickbooksItemThumb />}
    </div>
  )
}
