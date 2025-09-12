import { AppointmentStatus } from "./AppointmentStatus";
import { Pet } from "./Pet";
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
}
