import AlertCircle from '../../icons/AlertCircle'
import { Text, TextSize, TextWeight } from '../Typography/Text'

export const TasksPanelNotification = () => {
  return (
    <div className='Layer__tasks-header__notification'>
      <Text size={TextSize.sm} weight={TextWeight.bold} status='warning' invertColor>
        <AlertCircle size={11} />
        2 open tasks in 2024
      </Text>
    </div>
  )
}
