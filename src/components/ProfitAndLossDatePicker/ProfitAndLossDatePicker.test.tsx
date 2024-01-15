// import { useProfitAndLoss } from '../../hooks/useProfitAndLoss'

// import { ProfitAndLossDatePicker } from './ProfitAndLossDatePicker'
// import '@testing-library/jest-dom'
// import { render, screen } from '@testing-library/react'

jest.mock('../../hooks/useProfitAndLoss', () => ({
  useProfitAndLoss: jest.fn(),
}))
// const mockUseProfitAndLoss = useProfitAndLoss as jest.MockedFn<
//   typeof blankUseProfitAndLoss
// >

// const mockChangeDateRange = jest.fn()
// const blankUseProfitAndLoss = {
//   data: undefined,
//   isLoading: true,
//   error: undefined,
//   changeDateRange: mockChangeDateRange,
// }
// beforeEach(() => mockUseProfitAndLoss.mockReturnValue(blankUseProfitAndLoss))

// const wrapper = ({ children }) => <ProfitAndLoss>{children}</ProfitAndLoss>

it('keeps the test hanging around so it can get fixed', async () => {
  //   mockUseProfitAndLoss.mockReturnValue({
  //     ...blankUseProfitAndLoss,
  //     data: [],
  //     isLoading: false,
  // })
  //   render(<ProfitAndLossDatePicker />, { wrapper })
  //   const previousButton = screen.findByLabelText('View Previous Month')
  //   expect(previousButton).toBeInTheDocument()
})
