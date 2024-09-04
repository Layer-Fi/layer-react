import React from 'react'
import { Rules } from '../../types/rules'
import { Table, TableBody } from '../Table'
import { TableCell } from '../TableCell'
import { TableHead } from '../TableHead'
import { TableRow } from '../TableRow'
import { DATE_FORMAT } from '../../config/general'
import { parseISO, format as formatTime } from 'date-fns'
import { View } from '../Rules/Rules'

interface RulesTableProps {
  view: View
  data?: Rules
}

export const RulesTable = ({
  data
}: RulesTableProps) => {
  return (
    <Table>
      <TableHead>
        <TableRow isHeadRow rowKey='rules-head-row'>
          <TableCell isHeaderCell>
            Date added
          </TableCell>   
          <TableCell isHeaderCell>
            Name
          </TableCell>          
        </TableRow>
      </TableHead>
      <TableBody>
        {data != undefined && data?.rules.length > 0 ? data?.rules.map((row, index) => { 
            return (
              <React.Fragment key={row.id + '-' + index}>
                <TableRow rowKey={row.id + '-' + index}>
                  <TableCell>
                    {formatTime(parseISO(row.created_at), DATE_FORMAT)}             
                  </TableCell>        
                  <TableCell>
                    {row.name}
                  </TableCell>     
                </TableRow>
            </React.Fragment>
            )
          }) : null
        }
      </TableBody>
    </Table>
  )  
}
