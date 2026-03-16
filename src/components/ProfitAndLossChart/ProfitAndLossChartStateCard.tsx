import { useTranslation } from 'react-i18next'

import BarChart2Icon from '@icons/BarChart2'
import { IconBox } from '@components/IconBox/IconBox'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

export const ProfitAndLossChartStateCard = () => {
  const { t } = useTranslation()
  return (
    <div className='Layer__profit-and-loss-chart__state-card'>
      <IconBox>
        <BarChart2Icon />
      </IconBox>
      <div className='Layer__profit-and-loss-chart__state-card__text'>
        <Text weight={TextWeight.bold}>{t('linkedAccounts:dataIsSyncing', 'Data is syncing')}</Text>
        <Text
          size={TextSize.sm}
          className='Layer__profit-and-loss-chart__state-card__description'
        >
          {t('linkedAccounts:thisMayTakeUpToFewMinutes', 'This may take up to few minutes')}
        </Text>
      </div>
    </div>
  )
}
