import { ChartNoAxesColumn } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { P } from '@ui/Typography/Text'
import { IconBox } from '@components/IconBox/IconBox'

import './profitAndLossChartStateCard.scss'

export const ProfitAndLossChartStateCard = () => {
  const { t } = useTranslation()
  return (
    <div className='Layer__profit-and-loss-chart__state-card'>
      <IconBox>
        <ChartNoAxesColumn size={12} />
      </IconBox>
      <div className='Layer__profit-and-loss-chart__state-card__text'>
        <P weight='bold'>{t('linkedAccounts:label.data_is_syncing', 'Data is syncing')}</P>
        <P size='sm' align='center'>
          {t('linkedAccounts:label.may_take_few_minutes', 'This may take a few minutes')}
        </P>
      </div>
    </div>
  )
}
