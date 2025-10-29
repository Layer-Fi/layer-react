import { Button } from '../../ui/Button/Button'

interface BankTransactionsConfirmAllButtonProps {
  onClick: () => void
}

export const BankTransactionsConfirmAllButton = ({ onClick }: BankTransactionsConfirmAllButtonProps) => {
  return (
    <Button
      variant='solid'
      onClick={onClick}
    >
      Confirm all
    </Button>
  )
}
