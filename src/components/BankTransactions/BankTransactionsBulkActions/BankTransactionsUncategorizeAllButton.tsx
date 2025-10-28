import { Button } from '../../ui/Button/Button'

interface BankTransactionsUncategorizeAllButtonProps {
  onClick: () => void
}

export const BankTransactionsUncategorizeAllButton = ({ onClick }: BankTransactionsUncategorizeAllButtonProps) => {
  return (
    <Button
      variant='solid'
      onClick={onClick}
    >
      Uncategorize all
    </Button>
  )
}
