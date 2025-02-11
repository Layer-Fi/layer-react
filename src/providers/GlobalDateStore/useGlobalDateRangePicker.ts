export function useGlobalDateRangePicker() {
  return null
}
// import { useMemo } from 'react'
// import {
//   type DateRangePickerMode,
//   useGlobalDateRange,
//   useGlobalDateRangeActions,
// } from './GlobalDateStoreProvider'
// import {
//   DEFAULT_ALLOWED_PICKER_MODES,
// } from '../../components/DatePicker/ModeSelector/DatePickerModeSelector'
// import { getArrayWithAtLeastOneOrFallback }
// from '../../utils/array/getArrayWithAtLeastOneOrFallback'

// export function useGlobalDateRangePicker({
//   allowedDatePickerModes,
//   defaultDatePickerMode,
//   onSetMonth,
// }: {
//   allowedDatePickerModes?: ReadonlyArray<DateRangePickerMode>
//   defaultDatePickerMode?: DateRangePickerMode
//   onSetMonth?: (startOfMonth: Date) => void
// }) {
//   const { start, end, rangeDisplayMode } = useGlobalDateRange()
//   const {
//     setMonth,
//     setRangeWithExplicitDisplayMode,
//     setRangeDisplayMode,
//   } = useGlobalDateRangeActions()

//   const allowedDateRangePickerModes = getArrayWithAtLeastOneOrFallback(
//     allowedDatePickerModes ?? (defaultDatePickerMode ? [defaultDatePickerMode] : []),
//     DEFAULT_ALLOWED_PICKER_MODES,
//   )

//   const desiredRangeMode = allowedDateRangePickerModes.includes(rangeDisplayMode)
//     ? rangeDisplayMode
//     : allowedDateRangePickerModes[0]

//   const { dateFormat, selected } = useMemo(() => {
//     if (rangeDisplayMode === 'monthPicker') {
//       return {
//         selected: start,
//         dateFormat: undefined,
//       } as const
//     }

//     return {
//       /*
//        * This intentionally needs to be cast to a mutable array. The `DatePicker`
//        * component should accept a readonly array, but that refactor is out of scope.
//        */
//       selected: [start, end] as [Date, Date],
//       dateFormat: 'MMM d',
//     } as const
//   }, [
//     start,
//     end,
//     rangeDisplayMode,
//   ])

//   const { setSelected } = useMemo(() => {
//     if (desiredRangeMode === 'monthPicker') {
//       return {
//         setSelected: ({ start }: { start: Date }) => {
//           setMonth({ start })

//           onSetMonth?.(start)
//         },
//       } as const
//     }

//     return {
//       setSelected: ({ start, end }: { start: Date, end: Date }) => {
//         setRangeWithExplicitDisplayMode({ start, end, rangeDisplayMode: desiredRangeMode })
//       },
//     } as const
//   }, [
//     desiredRangeMode,
//     onSetMonth,
//     setMonth,
//     setRangeWithExplicitDisplayMode,
//   ])

//   return {
//     allowedDateRangePickerModes,
//     dateFormat,
//     rangeDisplayMode,
//     selected,
//     setSelected,
//     setRangeDisplayMode,
//   }
// }
