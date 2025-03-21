import { Text, TextSize, TextWeight } from '../Typography/Text'

export const TasksPanelNotification = () => {
  return (
    <div className='Layer__tasks-header__notification'>
      <Text size={TextSize.sm} weight={TextWeight.bold} status='warning' invertColor>5 tasks overdue</Text>
    </div>
  )
}
