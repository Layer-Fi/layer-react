import { Fragment } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Pagination } from '@ui/Pagination/Pagination'

const noop = () => {}

const label: React.CSSProperties = { fontSize: 12, opacity: 0.6 }

const meta: Meta<typeof Pagination> = {
  title: 'UI/Pagination',
  component: Pagination,
}

export default meta

type Story = StoryObj<typeof Pagination>

const PAGE_SIZE = 10
const TOTAL_COUNT = 100

const CASES: { label: string, currentPage: number }[] = [
  { label: 'first page', currentPage: 1 },
  { label: 'middle', currentPage: 5 },
  { label: 'last page', currentPage: 10 },
]

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'max-content max-content',
        gap: '24px 32px',
        alignItems: 'center',
        padding: 24,
      }}
    >
      {CASES.map(({ label: caseLabel, currentPage }) => (
        <Fragment key={caseLabel}>
          <span style={label}>{caseLabel}</span>
          <Pagination
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            totalCount={TOTAL_COUNT}
            onPageChange={noop}
          />
        </Fragment>
      ))}
    </div>
  ),
}
