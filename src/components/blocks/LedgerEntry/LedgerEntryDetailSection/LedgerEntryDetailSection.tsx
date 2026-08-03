import { type ReactNode } from 'react'

import { Heading } from '@ui/Typography/Heading'

import './ledgerEntryDetailSection.scss'

export interface LedgerEntryDetailSectionProps {
  title?: ReactNode
  children: ReactNode
}

export const LedgerEntryDetailSection = ({ title, children }: LedgerEntryDetailSectionProps) => {
  return (
    <section className='Layer__LedgerEntryDetailSection'>
      {title && (
        <Heading level={3} size='sm' pbe='md'>
          {title}
        </Heading>
      )}
      <dl className='Layer__LedgerEntryDetailSection__Grid'>{children}</dl>
    </section>
  )
}
