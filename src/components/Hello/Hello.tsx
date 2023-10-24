import React from 'react'
import './Hello.css'

type Props = {
  extra?: string | undefined
}

export default ({ extra }: Props) => {
  return <div className="hello">Hello{extra && `, ${extra}`}!</div>
}
