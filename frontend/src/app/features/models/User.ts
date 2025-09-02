import { Pet } from "./Pet";
import { Role } from "./Role";

export interface User {
  id: number;
  name: string;
  email: string;
  userStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED';
  phone: string;
  birthDate: string;
  roles: Role[];
  cpf: string;
  pets: Pet[];
}
