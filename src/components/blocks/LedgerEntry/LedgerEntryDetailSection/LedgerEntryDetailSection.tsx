import { type ReactNode } from 'react'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { Heading } from '@ui/Typography/Heading'

import './ledgerEntryDetailSection.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__LedgerEntryDetailSection: 'Layer__EntryDetailSection',
  Layer__LedgerEntryDetailSection__Grid: 'Layer__EntryDetailSection__Grid',
})

export interface LedgerEntryDetailSectionProps {
  title?: ReactNode
  children: ReactNode
}

export const LedgerEntryDetailSection = ({ title, children }: LedgerEntryDetailSectionProps) => {
  return (
    <section className={legacyClassNames('Layer__LedgerEntryDetailSection')}>
      {title && (
        <Heading level={3} size='sm' pbe='md'>
          {title}
        </Heading>
      )}
      <dl className={legacyClassNames('Layer__LedgerEntryDetailSection__Grid')}>{children}</dl>
    </section>
  )
}
