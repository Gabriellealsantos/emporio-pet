export interface PetInsertDTO {
  name: string;
  species: string;
  breedId: number;
  birthDate: string;
  notes: string | null;
}
