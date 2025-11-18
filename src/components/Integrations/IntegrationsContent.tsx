import { useContext } from 'react'

import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'
import { IntegrationsQuickbooksItemThumb } from '@components/Integrations/IntegrationsQuickbooksItemThumb/IntegrationsQuickbooksItemThumb'

export const IntegrationsContent = () => {
  const { quickbooksConnectionStatus } = useContext(QuickbooksContext)

  return (
    <div className='Layer__linked-accounts__list'>
      {quickbooksConnectionStatus?.is_connected && <IntegrationsQuickbooksItemThumb />}
    </div>
  )
}
