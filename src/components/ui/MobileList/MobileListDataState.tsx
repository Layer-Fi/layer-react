import { DataState, type DataStateProps } from '@components/DataState/DataState'
import { TextSize } from '@components/Typography/Text'

import './mobileListDataState.scss'

type MobileListDataStateProps = Pick<DataStateProps, 'title' | 'description' | 'status' | 'icon'>

export const MobileListDataState = ({
  title,
  description,
  status,
  icon,
}: MobileListDataStateProps) => {
  return (
    <DataState
      status={status}
      title={title}
      description={description}
      icon={icon}
      inline
      titleSize={TextSize.md}
      className='Layer__MobileListDataState'
    />
  )
}
