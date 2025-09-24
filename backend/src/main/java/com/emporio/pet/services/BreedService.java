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

    /**
     * Retorna a entidade Breed pelo ID ou lança ResourceNotFoundException.
     */
    @Transactional(readOnly = true)
    public Breed findEntityById(Long id) {
        return breedRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Raça não encontrada com o ID: " + id));
    }

    /**
     * Retorna todas as raças filtradas por nome e espécie.
     */
    @Transactional(readOnly = true)
    public List<BreedDTO> findAll(String name, Species species) {
        String nameFilter = (name != null && name.trim().isEmpty()) ? null : name;

        List<Breed> list = breedRepository.findByNameContainingAndSpecies(nameFilter, species);
        return list.stream().map(BreedDTO::new).collect(Collectors.toList());
    }

    /**
     * Retorna a raça pelo ID encapsulada em BreedDTO ou lança ResourceNotFoundException.
     */
    @Transactional(readOnly = true)
    public BreedDTO findById(Long id) {
        Breed breed = breedRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Raça não encontrada com o ID: " + id));
        return new BreedDTO(breed);
    }

    /**
     * Cria uma nova raça a partir do DTO e retorna o DTO persistido.
     */
    @Transactional
    public BreedDTO create(BreedDTO dto) {
        Breed entity = new Breed();
        entity.setName(dto.getName());
        entity.setSpecies(dto.getSpecies());
        entity = breedRepository.save(entity);
        return new BreedDTO(entity);
    }

    /**
     * Atualiza os dados de uma raça existente e retorna o DTO atualizado.
     */
    @Transactional
    public BreedDTO update(Long id, BreedDTO dto) {
        Breed entity = breedRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Raça não encontrada com o ID: " + id));
        entity.setName(dto.getName());
        entity.setSpecies(dto.getSpecies());
        entity = breedRepository.save(entity);
        return new BreedDTO(entity);
    }

    /**
     * Deleta a raça pelo ID, lançando ResourceNotFoundException se não existir
     * ou DatabaseException se houver violação de integridade.
     */
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
