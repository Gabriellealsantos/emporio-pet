import { AppointmentStatus } from "./AppointmentStatus";
import { InvoiceStatus } from "./InvoiceStatus";
import { Pet } from "./Pet";
import { Review } from "./Review";
import { Service } from "./Service";
import { User } from "./User";

export interface Appointment {
  id: number;
  startDateTime: string;
  endDateTime: string;
  status: AppointmentStatus;
  pet: Pet;
  service: Service;
  employee: User;
  review?: Review;
  invoiceId?: number;
  invoiceStatus?: InvoiceStatus;
}
