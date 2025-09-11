package com.emporio.pet.repositories;

import com.emporio.pet.entities.Breed;
import com.emporio.pet.entities.enums.Species;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BreedRepository extends JpaRepository<Breed, Long> {

    @Query("SELECT b FROM Breed b WHERE " +
            "(:name IS NULL OR UPPER(b.name) LIKE UPPER(CONCAT('%', :name, '%'))) AND " +
            "(:species IS NULL OR b.species = :species)")
    List<Breed> findByNameContainingAndSpecies(String name, Species species);
}