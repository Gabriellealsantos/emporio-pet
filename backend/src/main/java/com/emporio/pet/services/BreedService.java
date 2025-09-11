package com.emporio.pet.services;

import com.emporio.pet.dto.BreedDTO;
import com.emporio.pet.entities.Breed;
import com.emporio.pet.entities.enums.Species;
import com.emporio.pet.repositories.BreedRepository;
import com.emporio.pet.services.exceptions.DatabaseException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BreedService {

    private final BreedRepository breedRepository;

    public BreedService(BreedRepository breedRepository) {
        this.breedRepository = breedRepository;
    }

    @Transactional(readOnly = true)
    public Breed findEntityById(Long id) {
        return breedRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Raça não encontrada com o ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<BreedDTO> findAll(String name, Species species) {
        String nameFilter = (name != null && name.trim().isEmpty()) ? null : name;

        List<Breed> list = breedRepository.findByNameContainingAndSpecies(nameFilter, species);
        return list.stream().map(BreedDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BreedDTO findById(Long id) {
        Breed breed = breedRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Raça não encontrada com o ID: " + id));
        return new BreedDTO(breed);
    }

    @Transactional
    public BreedDTO create(BreedDTO dto) {
        Breed entity = new Breed();
        entity.setName(dto.getName());
        entity.setSpecies(dto.getSpecies());
        entity = breedRepository.save(entity);
        return new BreedDTO(entity);
    }

    @Transactional
    public BreedDTO update(Long id, BreedDTO dto) {
        Breed entity = breedRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Raça não encontrada com o ID: " + id));
        entity.setName(dto.getName());
        entity.setSpecies(dto.getSpecies());
        entity = breedRepository.save(entity);
        return new BreedDTO(entity);
    }

    public void delete(Long id) {
        if (!breedRepository.existsById(id)) {
            throw new ResourceNotFoundException("Raça não encontrada com o ID: " + id);
        }
        try {
            breedRepository.deleteById(id);
        }
        catch (DataIntegrityViolationException e) {
            throw new DatabaseException("Não é possível deletar uma raça que já está associada a um pet.");
        }
    }
}