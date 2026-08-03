import { useCallback, useContext } from 'react'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Banner } from '@ui/Banner/Banner'
import { Button as LayerButton } from '@ui/Button/Button'

export const NoBankAccountsLinkedBanner = () => {
  const { addConnection } = useContext(LinkedAccountsContext)
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()
  const handleLinkBankAccounts = useCallback(() => {
    void addConnection('PLAID')
  }, [addConnection])
  const Icon = isMobile ? null : <Info size={16} />
  const title = t('linkedAccounts:label.link_your_bank_accounts', 'Link your bank accounts')
  const description = t('linkedAccounts:label.link_your_bank_accounts_description', 'Linking your bank accounts allows us to load your bank transactions and automatically categorize them.')
  const Button = <LayerButton onPress={handleLinkBankAccounts} variant='outlined'>{title}</LayerButton>
  return <Banner title={title} description={description} slots={{ Icon, Button }} />
}
