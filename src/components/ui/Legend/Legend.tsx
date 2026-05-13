import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, Stack, VStack } from '@ui/Stack/Stack'
import { Swatch } from '@ui/Swatch/Swatch'
import { Span } from '@ui/Typography/Text'
import {
  type ColorSelector,
  DEFAULT_TYPE_COLOR_MAPPING,
  type SeriesData,
} from '@components/DetailedCharts/types'

import './legend.scss'

export enum LegendLayout {
  Table = 'Table',
  Aligned = 'Aligned',
}

export type LegendProps<T extends SeriesData> = {
  items: ReadonlyArray<T>
  total: number
  colorSelector: ColorSelector<T>
  formatValue: (value: number) => string
  layout?: LegendLayout
}

export const Legend = <T extends SeriesData>({
  items,
  total,
  colorSelector,
  formatValue,
  layout = LegendLayout.Table,
}: LegendProps<T>) => {
  const { formatPercent } = useIntlFormatter()

  if (layout === LegendLayout.Aligned) {
    return (
      <div className='Layer__UI__Legend Layer__UI__Legend--aligned'>
        {items.map((item) => {
          const percentage = total > 0 ? item.value / total : 0
          const flexGrow = total > 0 ? item.value / total : 1
          const intentionalStyleOverrideForDynamicFlexGrow = {
            display: 'flex',
            flexDirection: 'column' as const,
            flexGrow,
            flexBasis: 0,
          }
          return (
            <div
              key={item.name}
              className='Layer__UI__Legend__AlignedItem'
              style={intentionalStyleOverrideForDynamicFlexGrow}
            >
              <Span size='sm' variant='subtle' ellipsis withTooltip>{item.displayName}</Span>
              <Span size='lg' className='Layer__UI__Legend__AlignedValue' weight='bold'>
                {formatValue(item.value)}
              </Span>
              <Span size='sm' variant='subtle'>
                {formatPercent(percentage, { maximumFractionDigits: 0 })}
              </Span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Stack
      direction='row'
      className='Layer__UI__Legend Layer__UI__Legend--table'
      gap='lg'
      align='start'
    >
      {items.map((item) => {
        const { color, opacity } = colorSelector(item) ?? DEFAULT_TYPE_COLOR_MAPPING
        const percentage = total > 0 ? item.value / total : 0
        return (
          <VStack key={item.name} className='Layer__UI__Legend__Item' gap='2xs'>
            <HStack className='Layer__UI__Legend__Label' gap='2xs' align='center'>
              <Swatch color={color} opacity={opacity} />
              <Span size='md' ellipsis withTooltip>{item.displayName}</Span>
            </HStack>
            <HStack className='Layer__UI__Legend__Meta' gap='2xs' align='baseline'>
              <Span className='Layer__UI__Legend__Value' size='sm'>
                {formatValue(item.value)}
              </Span>
              <Span className='Layer__UI__Legend__Percentage' size='sm' variant='subtle'>
                {formatPercent(percentage, { maximumFractionDigits: 0 })}
              </Span>
            </HStack>
          </VStack>
        )
      })}
    </Stack>
  )
}
