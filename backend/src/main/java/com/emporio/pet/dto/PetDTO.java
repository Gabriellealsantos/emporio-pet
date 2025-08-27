package com.emporio.pet.dto;

import com.emporio.pet.entities.Pet;
import java.time.LocalDate;

public class PetDTO {

    private Long id;
    private String name;
    private LocalDate birthDate;
    private String notes;
    private BreedDTO breed;

    public PetDTO() {
    }

    public PetDTO(Pet entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.birthDate = entity.getBirthDate();
        this.notes = entity.getNotes();
        if (entity.getBreed() != null) {
            this.breed = new BreedDTO(entity.getBreed());
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public BreedDTO getBreed() {
        return breed;
    }

    public void setBreed(BreedDTO breed) {
        this.breed = breed;
    }
}