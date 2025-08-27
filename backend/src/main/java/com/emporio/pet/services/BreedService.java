package com.emporio.pet.services;

import com.emporio.pet.entities.Breed;
import com.emporio.pet.repositories.BreedRepository;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BreedService {

    private final BreedRepository breedRepository;

    public BreedService(BreedRepository breedRepository) {
        this.breedRepository = breedRepository;
    }

    @Transactional(readOnly = true)
    public Breed findById(Long id) {
        return breedRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Raça não encontrada com o ID: " + id));
    }
}
