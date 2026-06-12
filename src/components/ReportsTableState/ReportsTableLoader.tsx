import { useTranslation } from 'react-i18next'

import { Alignment } from '@schemas/reports/unifiedReport'
import { Column, Row, Table, TableHeader } from '@ui/Table/Table'
import { SkeletonTableLoader } from '@components/SkeletonTableLoader/SkeletonTableLoader'

type ReportsTableLoaderProps = {
  typeColumnHeader?: string
  totalColumnHeader?: string
  showHeader?: boolean
}

export const ReportsTableLoader = ({
  typeColumnHeader,
  totalColumnHeader,
  showHeader = true,
}: ReportsTableLoaderProps) => {
  const { t } = useTranslation()
  const typeColumnHeaderText = typeColumnHeader ?? t('common:label.type', 'Type')
  const totalColumnHeaderText = totalColumnHeader ?? t('common:label.total', 'Total')

  return (
    <div className='Layer__UI__Table-ScrollContainer'>
      <Table nonAria bottomSpacing className='Layer__UI__Table__Report'>
        {showHeader && (
          <TableHeader nonAria>
            <Row nonAria>
              <Column nonAria>{typeColumnHeaderText}</Column>
              <Column nonAria alignment={Alignment.Right}>
                {totalColumnHeaderText}
              </Column>
            </Row>
          </TableHeader>
        )}
        <SkeletonTableLoader
          rows={6}
          cols={[
            { colSpan: 1, trimLastXRows: 4 },
            { colSpan: 1, parts: 2 },
          ]}
        />
      </Table>
    </div>
  )
}
