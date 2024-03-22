import React, { useState } from 'react'
import { useLedgerAccounts } from '../../hooks/useLedgerAccounts'
import DownloadCloud from '../../icons/DownloadCloud'
import { centsToDollars } from '../../models/Money'
import { Button, ButtonVariant } from '../Button'
import { ChartOfAccountsNewForm } from '../ChartOfAccountsNewForm'
import { ChartOfAccountsRow } from '../ChartOfAccountsRow'
import { Container, Header } from '../Container'
import { Heading } from '../Typography'

const COMPONENT_NAME = 'ledger-accounts'

export const LedgerAccounts = () => {
  const { data, isLoading } = useLedgerAccounts()
  const [showingForm, setShowingForm] = useState(false)

  console.log(data)

  return (
    <Container name={COMPONENT_NAME}>
      {!data || isLoading ? (
        'Loading...'
      ) : (
        <div className={`Layer__${COMPONENT_NAME}__main-panel`}>
          <Header className={`Layer__${COMPONENT_NAME}__header`}>
            <Heading className={`Layer__${COMPONENT_NAME}__title`}>
              Chart of Accounts
            </Heading>
            <div className={`Layer__${COMPONENT_NAME}__actions`}>
              <Button
                variant={ButtonVariant.secondary}
                rightIcon={<DownloadCloud size={12} />}
              >
                Download
              </Button>
              <Button onClick={() => setShowingForm(!showingForm)}>
                Add Account
              </Button>
            </div>
          </Header>

          <div className={`Layer__${COMPONENT_NAME}__chart-of-accounts__table`}>
            <div className='Layer__alt-table-row'>
              <div className='Layer__alt-table__head-cell Layer__coa__name'>
                Name
              </div>
              <div className='Layer__alt-table__head-cell Layer__coa__type'>
                Type
              </div>
              <div className='Layer__alt-table__head-cell Layer__coa__subtype'>
                Sub-Type
              </div>
              <div className='Layer__alt-table__head-cell Layer__coa__balance'>
                Balance
              </div>
              <div className='Layer__alt-table__head-cell Layer__coa__actions'></div>
            </div>

            {data.accounts.map((account, idx) => {
              return (
                <>
                  <div className='Layer__alt-table-row'>
                    <div className='Layer__alt-table__cell Layer__coa__name'>
                      {account.name}
                    </div>
                    <div className='Layer__alt-table__cell Layer__coa__type'>
                      {/* @TODO what is type and subtype*/}
                      {account.pnl_category}
                    </div>
                    <div className='Layer__alt-table__cell Layer__coa__subtype'>
                      Sub-Type
                    </div>
                    <div className='Layer__alt-table__cell Layer__coa__balance'>
                      {centsToDollars(Math.abs(account.balance || 0))}
                    </div>
                    <div className='Layer__alt-table__cell Layer__coa__actions'>
                      Actions TBD
                    </div>
                  </div>
                  {(account.subAccounts || []).map(subAccount => (
                    <ChartOfAccountsRow
                      key={subAccount.id}
                      account={subAccount}
                      depth={0}
                    />
                  ))}
                </>
              )
            })}
          </div>
        </div>
      )}
    </Container>
  )
  // return (
  //   <div className='Layer__component Layer__ledger-accounts'>
  //     {!data || isLoading ? (
  //       'Loading.'
  //     ) : (
  //       <>
  //         <div className='Layer__chart-of-accounts__header'>
  //           <h2 className='Layer__chart-of-accounts__title'>
  //             Chart of Accounts
  //           </h2>
  //           <div className='Layer__chart-of-accounts__actions'>
  //             <button className='Layer__chart-of-accounts__download-button'>
  //               <DownloadCloud />
  //               Download
  //             </button>
  //             <button
  //               className='Layer__chart-of-accounts__edit-accounts-button'
  //               onClick={() => setShowingForm(!showingForm)}
  //             >
  //               Edit Accounts
  //             </button>
  //           </div>
  //         </div>
  //         {showingForm && <ChartOfAccountsNewForm />}
  //         <div className='Layer__chart-of-accounts__table'>
  //           <div className='Layer__chart-of-accounts__table-cell Layer__chart-of-accounts__table-cell--header'>
  //             Name
  //           </div>
  //           <div className='Layer__chart-of-accounts__table-cell Layer__chart-of-accounts__table-cell--header'>
  //             Type
  //           </div>
  //           <div className='Layer__chart-of-accounts__table-cell Layer__chart-of-accounts__table-cell--header'>
  //             Sub-Type
  //           </div>
  //           <div className='Layer__chart-of-accounts__table-cell Layer__chart-of-accounts__table-cell--header Layer__chart-of-accounts__table-cell--header-balance'>
  //             Balance
  //           </div>
  //           <div className='Layer__chart-of-accounts__table-cell Layer__chart-of-accounts__table-cell--header'></div>
  //           {data.accounts.map(account => (
  //             <ChartOfAccountsRow
  //               key={account.id}
  //               account={account}
  //               depth={0}
  //             />
  //           ))}
  //         </div>
  //       </>
  //     )}
  //   </div>
  // )
}
