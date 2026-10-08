import { type ReactNode, useState } from 'react'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'

import './formRowSheet.scss'

export type FormRowSheetRow = {
  id: string
  summary: ReactNode
  answerLabel: string | null
  isComplete: boolean
}

type FormRowSheetProps = {
  rows: ReadonlyArray<FormRowSheetRow>
  prompt?: string | null
  countLabel: string
  isDisabled?: boolean
  /** `advance` opens the next incomplete row; call it once the open row holds a full answer. */
  renderEditor: (rowId: string, actions: { advance: () => void }) => ReactNode
}

/** One editor open at a time over a list of rows, each answered on its own. */
export const FormRowSheet = ({ rows, prompt, countLabel, isDisabled, renderEditor }: FormRowSheetProps) => {
  const [openId, setOpenId] = useState(() => rows.find(({ isComplete }) => !isComplete)?.id ?? null)

  // The row just answered may not have re-rendered as complete yet, so it is skipped explicitly.
  const advanceFrom = (rowId: string) =>
    setOpenId(rows.find(({ id, isComplete }) => id !== rowId && !isComplete)?.id ?? null)

  return (
    <VStack gap='sm'>
      {prompt ? <P size='sm' pi='md'>{prompt}</P> : null}
      <VStack className='Layer__FormRowSheet'>
        {rows.map(({ id, summary, answerLabel }) => {
          const isOpen = openId === id

          return (
            <VStack key={id} className='Layer__FormRowSheet__Row' {...toDataProperties({ open: isOpen })} pi='md'>
              <Button
                className='Layer__FormRowSheet__RowSummary'
                variant='text'
                underline={false}
                fullWidth
                isDisabled={isDisabled}
                onPress={() => setOpenId(id)}
              >
                <HStack align='center' gap='xs' overflow='hidden' fluid>
                  {summary}
                  {answerLabel
                    ? <Span className='Layer__FormRowSheet__RowAnswer' size='sm' align='right' ellipsis noWrap>{answerLabel}</Span>
                    : null}
                </HStack>
              </Button>
              {isOpen
                ? <VStack pbe='sm' pbs='3xs'>{renderEditor(id, { advance: () => advanceFrom(id) })}</VStack>
                : null}
            </VStack>
          )
        })}
      </VStack>
      <HStack justify='end' pi='md'>
        <Span size='xs' variant='subtle'>{countLabel}</Span>
      </HStack>
    </VStack>
  )
}
