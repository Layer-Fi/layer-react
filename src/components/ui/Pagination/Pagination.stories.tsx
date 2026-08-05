import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Pagination } from '@ui/Pagination/Pagination'

import { Gallery, Row } from '@testUtils/storybook/layout/gallery'

const noop = () => {}

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
    <Gallery>
      {CASES.map(({ label, currentPage }) => (
        <Row key={label} label={label} labelSize={120}>
          <Pagination
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            totalCount={TOTAL_COUNT}
            onPageChange={noop}
          />
        </Row>
      ))}
    </Gallery>
  ),
}
