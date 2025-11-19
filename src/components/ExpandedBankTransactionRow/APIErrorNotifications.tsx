import { useEffect, useState } from 'react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import AlertOctagon from '@icons/AlertOctagon'
import { Text } from '@components/Typography/Text'

interface APIErrorNotificationsProps {
  bankTransaction: BankTransaction
  containerWidth?: number
}

interface Notification {
  bankTransactionId: string
  timestamp: number
  title: string
  message: string
}

const ERROR_TITLE = 'Approval Failed'
const ERROR_MESSAGE = 'Something went wrong, try again later'
const NOTIFICATION_TIME = 4000
const FADE_OUT_TIME_WAIT = 1000

let notificationsCache: Notification[] = []

export const APIErrorNotifications = ({
  bankTransaction,
  containerWidth,
}: APIErrorNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const pushNotification = (title: string, message: string) => {
    const timestamp = new Date().valueOf()
    if (
      notificationsCache.find(
        n =>
          n.timestamp === timestamp
          && n.bankTransactionId !== bankTransaction.id,
      )
    ) {
      return
    }
    notificationsCache = notificationsCache.concat({
      bankTransactionId: bankTransaction.id,
      timestamp,
      title,
      message,
    })
    const ids = notificationsCache.map(
      ({ bankTransactionId }) => bankTransactionId,
    )
    const timestamps = notificationsCache.map(({ timestamp }) => timestamp)
    notificationsCache = notificationsCache.filter(
      ({ bankTransactionId, timestamp }, index) =>
        !ids.includes(bankTransactionId, index + 1)
        && !timestamps.includes(timestamp, index + 1),
    )
    setNotifications(notificationsCache.concat())
  }

  const deleteNotification = (timestamp: number) => {
    notificationsCache = notificationsCache.filter(
      n => n.timestamp !== timestamp,
    )
    setNotifications(notificationsCache.concat())
  }

  useEffect(() => {
    if (bankTransaction.error) {
      pushNotification(ERROR_TITLE, ERROR_MESSAGE)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankTransaction.error])

  return (
    <div
      className='Layer__bank-transactions__notifications'
      style={containerWidth ? { left: containerWidth - 324 } : {}}
    >
      {notifications
        .filter(n => n.bankTransactionId === bankTransaction.id)
        .map(notification => (
          <Notification
            key={notification.timestamp}
            notification={notification}
            deleteNotification={deleteNotification}
          />
        ))}
    </div>
  )
}

const Notification = ({
  notification,
  deleteNotification,
}: {
  notification: Notification
  deleteNotification: (timestamp: number) => void
}) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)

    const timer = setTimeout(() => {
      hideNotification()
    }, NOTIFICATION_TIME)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hideNotification = () => {
    setVisible(false)
    setTimeout(() => {
      deleteNotification(notification.timestamp)
    }, FADE_OUT_TIME_WAIT)
  }

  return (
    <div
      className={`Layer__bank-transactions__notification ${
        visible ? 'notification-enter' : 'notification-exit'
      }`}
      onClick={hideNotification}
    >
      <div className='Layer__bank-transactions__notification-content'>
        <div className='Layer__bank-transactions__notification-icon'>
          <AlertOctagon size={14} />
        </div>
        <div className='Layer__bank-transactions__notification-text'>
          <Text
            as='span'
            className='Layer__bank-transactions__notification-title'
          >
            {notification.title}
          </Text>
          <Text
            as='span'
            className='Layer__bank-transactions__notification-message'
          >
            {notification.message}
          </Text>
        </div>
      </div>
    </div>
  )
}
