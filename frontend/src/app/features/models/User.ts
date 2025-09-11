import { Pet } from "./Pet";
import { Role } from "./Role";
import { Service } from "./Service";

export interface User {
  id: number;
  name: string;
  email: string;
  userStatus: 'BLOCKED' | 'NON_BLOCKED' | 'INACTIVE' | 'SUSPENDED';
  phone: string;
  birthDate: string;
  roles: Role[];

  cpf?: string;
  pets?: Pet[];

  jobTitle?: string;
  skilledServices?: Service[];
}
