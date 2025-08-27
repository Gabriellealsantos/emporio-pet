package com.emporio.pet.dto;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class PetUpdateDTO {

    @Size(min = 2, max = 80, message = "O nome deve ter entre 2 e 80 caracteres.")
    private String name;

    @PastOrPresent(message = "A data de nascimento não pode ser no futuro.")
    private LocalDate birthDate;

    private String notes;

    private Long breedId;

    public PetUpdateDTO() {
    }

    public PetUpdateDTO(String name, LocalDate birthDate, String notes, Long breedId) {
        this.name = name;
        this.birthDate = birthDate;
        this.notes = notes;
        this.breedId = breedId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getBreedId() {
        return breedId;
    }

    public void setBreedId(Long breedId) {
        this.breedId = breedId;
    }
}