import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { CounterpartyComboBox } from '@components/CategorizationRules/CategorizationRuleForm/CounterpartyComboBox'
import { CounterpartyMobileDrawer } from '@components/CategorizationRules/CategorizationRuleForm/CounterpartyMobileDrawer'

type CounterpartySelectProps = {
  label: string
  value: BankTransactionCounterparty | null
  onValueChange: (counterparty: BankTransactionCounterparty | null) => void
  showLabel?: boolean
  isReadOnly?: boolean
  isError?: boolean
  placeholder?: string
}

export const CounterpartySelect = (props: CounterpartySelectProps) => {
  const { isMobile } = useSizeClass()
  if (isMobile) {
    return <CounterpartyMobileDrawer {...props} />
  }
  return <CounterpartyComboBox {...props} />
}
