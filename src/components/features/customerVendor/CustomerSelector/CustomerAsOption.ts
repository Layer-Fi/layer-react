import { type Customer } from '@schemas/customer'
import { getCustomerName } from '@utils/customer'

export class CustomerAsOption {
  private internalCustomer: Customer

  constructor(customer: Customer) {
    this.internalCustomer = customer
  }

  get original() {
    return this.internalCustomer
  }

  get label() {
    return getCustomerName(this.internalCustomer)
  }

  get id() {
    return this.internalCustomer.id
  }

  get value() {
    return this.internalCustomer.id
  }
}
