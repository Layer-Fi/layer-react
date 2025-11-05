import { Text, TextSize, TextWeight } from '../Typography/Text'
import BarChart2Icon from '../../icons/BarChart2'
import { IconBox } from '../IconBox/IconBox'

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
