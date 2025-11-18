import BarChart2Icon from '@icons/BarChart2'
import { IconBox } from '@components/IconBox/IconBox'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

export const ChartStateCard = () => {
  return (
    <div className='Layer__profit-and-loss-chart__state-card'>
      <IconBox>
        <BarChart2Icon />
      </IconBox>
      <div className='Layer__profit-and-loss-chart__state-card__text'>
        <Text weight={TextWeight.bold}>Data is syncing</Text>
        <Text
          size={TextSize.sm}
          className='Layer__profit-and-loss-chart__state-card__description'
        >
          This may take up to few minutes
        </Text>
      </div>
    </div>
  )
}
