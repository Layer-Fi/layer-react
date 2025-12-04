import { useWizard } from "@components/Wizard/Wizard"
import ManageUploadTableView from "./ManageUploadTableView"

type DeleteUploadTransactionsStepProps={
  setTransactionsCount: (count:number) => void
}

export default function DeleteUploadTransactionsStep({setTransactionsCount}:DeleteUploadTransactionsStepProps) {
  const { next } = useWizard()

  function handleDelete(){
    next()
  }
  return (
    <div><ManageUploadTableView/></div>
  )
}
