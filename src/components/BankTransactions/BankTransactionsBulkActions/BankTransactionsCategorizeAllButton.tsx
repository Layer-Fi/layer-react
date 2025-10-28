import { Button } from '../../ui/Button/Button'

export enum CategorizationMode {
  Categorize = 'Categorize',
  Recategorize = 'Recategorize',
}

interface BankTransactionsCategorizeAllButtonProps {
  mode: CategorizationMode
  onClick: () => void
}

export const BankTransactionsCategorizeAllButton = ({ mode, onClick }: BankTransactionsCategorizeAllButtonProps) => {
  return (
    <Button
      variant='outlined'
      onClick={onClick}
    >
      {mode === CategorizationMode.Categorize ? 'Set category' : 'Recategorize all'}
    </Button>
  )
}
