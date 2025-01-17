import { useQuickbooks } from '../../hooks/useQuickbooks'

const Quickbooks = () => {
  const {
    syncFromQuickbooks,
    isSyncingFromQuickbooks,
    quickbooksIsLinked,
    linkQuickbooks,
    unlinkQuickbooks,
  } = useQuickbooks()

  return (
    <div>
      <div>
        Quickbooks OAuth connection status:
        {' '}
        {quickbooksIsLinked === undefined
          ? ''
          : quickbooksIsLinked
            ? 'established'
            : 'not connected'}
      </div>
      <br />
      {quickbooksIsLinked === null && 'Loading...'}
      {quickbooksIsLinked === false && (
        <button
          onClick={async () => {
            const authorizationUrl = await linkQuickbooks()
            window.location.href = authorizationUrl
          }}
        >
          Link Quickbooks
        </button>
      )}
      {quickbooksIsLinked === true
      && (isSyncingFromQuickbooks
        ? (
          'Syncing data from Quickbooks...'
        )
        : (
          <div>
            <button onClick={syncFromQuickbooks}>Sync Quickbooks</button>
            <button onClick={unlinkQuickbooks}>Unlink Quickbooks</button>
          </div>
        ))}
    </div>
  )
}

export { Quickbooks }
