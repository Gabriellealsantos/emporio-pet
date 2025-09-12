import { Breed } from "./Breed";
import { User } from "./User";

export interface Pet {
  id: number;
  name: string;
  birthDate: string;
  notes: string | null;
  breed: Breed;
  owner: User;
}
