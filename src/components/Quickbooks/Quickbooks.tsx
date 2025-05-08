import { useQuickbooks } from '../../hooks/useQuickbooks'

const Quickbooks = () => {
  const {
    syncFromQuickbooks,
    isSyncingFromQuickbooks,
    quickbooksIsConnected,
    linkQuickbooks,
    unlinkQuickbooks,
  } = useQuickbooks()

  return (
    <div>
      <div>
        Quickbooks OAuth connection status:
        {' '}
        {quickbooksIsConnected === undefined
          ? ''
          : quickbooksIsConnected
            ? 'established'
            : 'not connected'}
      </div>
      <br />
      {quickbooksIsConnected === undefined && 'Loading...'}
      {quickbooksIsConnected === false && (
        <button
          onClick={async () => {
            const authorizationUrl = await linkQuickbooks()
            window.location.href = authorizationUrl
          }}
        >
          Link Quickbooks
        </button>
      )}
      {quickbooksIsConnected === true
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
