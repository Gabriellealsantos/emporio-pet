package com.emporio.pet.dto;

import com.emporio.pet.entities.Breed;

public class BreedDTO {

    private Long id;
    private String name;

    public BreedDTO() {
    }

    public BreedDTO(Breed entity) {
        this.id = entity.getId();
        this.name = entity.getName();
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
}