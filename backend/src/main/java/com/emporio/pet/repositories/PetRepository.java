package com.emporio.pet.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.emporio.pet.entities.Pet;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerId(Long customerId);
}