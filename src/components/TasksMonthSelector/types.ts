import { Task, TasksMonthly } from '../../types/tasks'

export type TasksMonthSelectorProps = {
    tasks?: TasksMonthly[],
    currentDate: Date
    onClick: (date: Date) => void
}

export type MonthData = {
    year: number;
    month: number;
    total: number;
    completed: number;
    tasks: Task[];
    monthStr: string;
    startDate: Date;
    endDate: Date;
}

export type TaskMonthTileProps = {
    monthData: MonthData
    active?: boolean
    onClick: TasksMonthSelectorProps['onClick']
}
