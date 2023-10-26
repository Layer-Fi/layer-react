import React from 'react'
import useSWR from 'swr'
import './Hello.css'

type Props = {
  user?: string | undefined
}

const fetcher = url => fetch(url).then(res => res.json())

export default ({ user }: Props) => {
  const { data, error, isLoading } = useSWR(
    `https://api.github.com/users/${user || 'jyurek'}`,
    fetcher,
  )
  const name = isLoading ? '...' : data.name
  return (
    <>
      <div className="hello">Hello, {name}!</div>
    </>
  )
}
