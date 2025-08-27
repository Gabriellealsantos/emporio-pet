package com.emporio.pet.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.emporio.pet.entities.Pet;
import java.util.List;


public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerId(Long customerId);
}