import React from 'react'
import AlertCircle from '../../icons/AlertCircle'
import MoreVertical from '../../icons/MoreVertical'
import { HoverMenu } from '../HoverMenu'
import { Pill } from '../Pill/Pill'

type Props = {
  text: string
  config: { name: string; action: () => void }[]
}

export const LinkedAccountPill = ({ text, config }: Props) => {
  return (
    <>
      <Pill kind='error'>
        <AlertCircle size={14} /> {text}
        <div className='Layer__linked-accounts-pill__options-overlay'>
          <HoverMenu config={config}>
            <div className={'Layer__linked-accounts-pill__invisible-spacer'} />
          </HoverMenu>
        </div>
      </Pill>
    </>
  )
}
