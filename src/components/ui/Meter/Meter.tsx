import { forwardRef } from 'react'
import { Meter as ReactAriaMeter, MeterProps as ReactAriaMeterProps } from 'react-aria-components'
import { Label, Span } from '../Typography/Text'
import { HStack, VStack } from '../Stack/Stack'
import classNames from 'classnames'

const getClassnameForSubComponent = (className: string | undefined, suffix: string) => {
  return classNames(`${METER_CLASS_NAME}__${suffix}`, className && `${className}__${suffix}`)
}

type MeterProps = Omit<ReactAriaMeterProps, 'children' | 'className'> & {
  label: string
  meterOnly?: boolean
  className?: string
}
const METER_CLASS_NAME = 'Layer__Meter'
export const Meter = forwardRef<HTMLDivElement, MeterProps>(
  function Meter({ className, label, meterOnly, ...restProps }, ref) {
    return (
      <ReactAriaMeter {...restProps} className={classNames(METER_CLASS_NAME, className)} ref={ref} {...(meterOnly && { 'aria-label': label })}>
        {({ percentage, valueText }) => (
          <VStack gap='3xs' fluid>
            {!meterOnly
              && (
                <HStack justify='space-between'>
                  <Label slot='label'>{label}</Label>
                  <Span slot='value'>{valueText}</Span>
                </HStack>
              )}
            <HStack slot='bar'>
              <svg
                className={getClassnameForSubComponent(className, 'svg')}
                viewBox='0 0 100 4'
                preserveAspectRatio='none'
                aria-hidden='true'
                focusable='false'
              >
                <rect
                  className={getClassnameForSubComponent(className, 'track')}
                  x='0'
                  y='0'
                  width='100'
                  height='4'
                />
                <rect
                  className={getClassnameForSubComponent(className, 'fill')}
                  x='0'
                  y='0'
                  width={percentage}
                  height='4'
                />
              </svg>
            </HStack>
          </VStack>
        )}
      </ReactAriaMeter>
    )
  },
)
