import React from 'react'
import useSWR from 'swr'

type Props = {
  user?: string | undefined
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export const Hello = ({ user }: Props) => {
  const { data, isLoading } = useSWR(
    `https://api.github.com/users/${user || 'doneel'}`,
    fetcher,
  )
  const name = (isLoading ? '...' : data?.name) || 'User'
  return (
    <>
      <div className='hello'>Hello, {name}!</div>
    </>
  )
}
