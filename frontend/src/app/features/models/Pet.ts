import { Breed } from "./Breed";

export interface Pet {
  id: number;
  name: string;
  birthDate: string;
  notes: string | null;
  breed: Breed;
}
