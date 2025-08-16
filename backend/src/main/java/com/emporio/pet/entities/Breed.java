package com.emporio.pet.entities;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "tb_breed")
public class Breed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String species;

    public Breed() {
    }

    public Breed(Long id, String name, String species) {
        this.id = id;
        this.name = name;
        this.species = species;


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

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Breed breed = (Breed) o;
        return Objects.equals(id, breed.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}