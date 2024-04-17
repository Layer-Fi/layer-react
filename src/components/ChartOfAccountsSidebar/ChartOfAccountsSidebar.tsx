import React, { RefObject, useContext, useEffect, useState } from 'react'
import { ChartOfAccountsContext } from '../ChartOfAccounts/ChartOfAccounts'
import { ChartOfAccountsForm } from '../ChartOfAccountsForm'
import classNames from 'classnames'

const calcPos = (parentRef?: RefObject<HTMLDivElement>) => {
  if (!parentRef) {
    return 0
  }

  // @TODO
  // console.log(
  //   parentRef?.current?.offsetHeight,
  //   parentRef?.current?.scrollHeight,
  //   parentRef?.current?.scrollTop,
  //   parentRef?.current?.offsetTop,
  //   parentRef?.current?.getBoundingClientRect(),
  //   parentRef?.current?.getClientRects(),
  // )

  if (!parentRef?.current) {
    return 0
  }

  const windShift =
    parentRef?.current?.getBoundingClientRect().top < 0
      ? parentRef?.current?.getBoundingClientRect().top
      : 0

  const shift = parentRef?.current?.scrollTop - windShift
  // console.log(shift)
  if (shift < 0) {
    // console.log('case 1')
    return 0
  }
  if (parentRef?.current?.getBoundingClientRect().bottom < 480) {
    // console.log('case 2')
    return parentRef?.current?.offsetHeight - 480
  }
  // console.log('case 3')
  return shift
}

export const ChartOfAccountsSidebar = ({
  parentRef,
}: {
  parentRef?: RefObject<HTMLDivElement>
}) => {
  const { form } = useContext(ChartOfAccountsContext)
  const [offset, setOffset] = useState(calcPos(parentRef))

  useEffect(() => {
    setOffset(calcPos(parentRef))
  }, [form])

  return <ChartOfAccountsForm />

  // return (
  //   <div
  //     className={classNames(
  //       'Layer__chart-of-accounts__sidebar',
  //       form ? 'open' : '',
  //     )}
  //     style={{
  //       top: offset,
  //       background: '#f2f2f2',
  //     }}
  //   >
  //     <div className='Layer__chart-of-accounts__sidebar-content'>
  //       <ChartOfAccountsForm />
  //     </div>
  //   </div>
  // )
}
