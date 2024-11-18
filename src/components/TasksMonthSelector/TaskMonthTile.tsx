import React from 'react'
import { TaskMonthTileProps } from './types'
import classNames from 'classnames'
import { Text, TextSize } from '../Typography'
import CheckIcon from '../../icons/Check'
import AlertCircle from '../../icons/AlertCircle'

const TaskMonthTile = ({ monthData, onClick, active }: TaskMonthTileProps) => {
    const isCompleted = monthData.total === monthData.completed
    const baseClass = classNames(
        'Layer__tasks-month-selector__month',
        isCompleted && 'Layer__tasks-month-selector__month--completed',
        active && 'Layer__tasks-month-selector__month--active',
    )
    return (
        <div className={baseClass} onClick={() => onClick(monthData.startDate)}>
            <Text size={TextSize.sm} className='Layer__tasks-month-selector__month__str'>
                {monthData.monthStr}
            </Text>
            <Text size={TextSize.sm} className='Layer__tasks-month-selector__month__total'>
                {monthData.total > 0 && isCompleted ? (
                    monthData.total
                ) : ''}
            </Text>
            {isCompleted && monthData.total > 0 && (
                <span className='Layer__tasks-month-selector__month__completed'>
                    <CheckIcon size={12} />
                </span>
            )}
            {!isCompleted && monthData.total > 0 && (
                <span className='Layer__tasks-month-selector__month__incompleted'>
                    <Text size={TextSize.sm}>{monthData.total}</Text>
                    <AlertCircle size={12} />
                </span>
            )}
        </div>
    )
}

export { TaskMonthTile }