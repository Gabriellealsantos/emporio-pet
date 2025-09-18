export interface AppointmentInsertDTO {
  petId: number;
  serviceId: number;
  startDateTime: string;
  employeeId?: number | null;
}
