import { Appointment } from "./Appointment";
import { User } from "./User";

export interface Invoice {
  id: number;
  timestamp: string;
  totalAmount: number;
  status: 'AWAITING_PAYMENT' | 'PAID' | 'CANCELED';
  customer: User;
  appointments: Appointment[];
}
