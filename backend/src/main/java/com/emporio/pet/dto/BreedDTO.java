package com.emporio.pet.dto;

import com.emporio.pet.entities.Breed;
import com.emporio.pet.entities.enums.Species;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BreedDTO {

    private Long id;

    @NotBlank(message = "O nome da raça é obrigatório.")
    @Size(min = 2, max = 80)
    private String name;

    private Species species;


    public BreedDTO() {
    }

    public BreedDTO(Long id, String name, Species species) {
        this.id = id;
        this.name = name;
        this.species = species;
    }

    public BreedDTO(Breed entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.species = entity.getSpecies();
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

    public Species getSpecies() {
        return species;
    }

    public void setSpecies(Species species) {
        this.species = species;
    }
}