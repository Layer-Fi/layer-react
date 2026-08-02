import { type ReactNode } from 'react'

import { Heading } from '@ui/Typography/Heading'

import './entryDetailSection.scss'

export interface EntryDetailSectionProps {
  title?: ReactNode
  children: ReactNode
}

export const EntryDetailSection = ({ title, children }: EntryDetailSectionProps) => {
  return (
    <section className='Layer__EntryDetailSection'>
      {title && (
        <Heading level={3} size='sm' pbe='md'>
          {title}
        </Heading>
      )}
      <dl className='Layer__EntryDetailSection__Grid'>{children}</dl>
    </section>
  )
}
