import { Appointment } from "./Appointment";
import { Customer } from "./Customer";

export interface Invoice {
  id: number;
  timestamp: string;
  totalAmount: number;
  status: 'AWAITING_PAYMENT' | 'PAID' | 'CANCELED';
  customer: Customer;
  appointments: Appointment[];
}
