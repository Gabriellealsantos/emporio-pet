package com.emporio.pet.services;

import com.emporio.pet.dto.PetAdminInsertDTO;
import com.emporio.pet.dto.PetDTO;
import com.emporio.pet.dto.PetInsertDTO;
import com.emporio.pet.dto.PetUpdateDTO;
import com.emporio.pet.entities.Breed;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.Pet;
import com.emporio.pet.entities.User;
import com.emporio.pet.repositories.CustomerRepository;
import com.emporio.pet.repositories.PetRepository;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final AuthService authService;
    private final BreedService breedService;
    private final CustomerRepository customerRepository;

    public PetService(PetRepository petRepository, AuthService authService, BreedService breedService, CustomerRepository customerRepository) {
        this.petRepository = petRepository;
        this.authService = authService;
        this.breedService = breedService;
        this.customerRepository = customerRepository;
    }

    /**
     * Retorna a lista de pets do cliente autenticado.
     */
    @Transactional(readOnly = true)
    public List<PetDTO> findMyPets() {
        User user = authService.authenticated();

        if (!(user instanceof Customer customer)) {
            return List.of();
        }

        List<Pet> pets = petRepository.findByOwnerId(customer.getId());
        return pets.stream().map(PetDTO::new).collect(Collectors.toList());
    }

    /**
     * Retorna um Pet por ID, validando permissão (self ou admin).
     */
    @Transactional(readOnly = true)
    public PetDTO findById(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet não encontrado com o ID: " + id));

        if (!authService.isSelfOrAdmin(pet.getOwner().getId())) {
            throw new ForbiddenException("Acesso negado.");
        }
        return new PetDTO(pet);
    }

    /**
     * Cria um pet associado ao cliente autenticado (fluxo cliente).
     */
    @Transactional
    public PetDTO createPet(PetInsertDTO dto) {
        User user = authService.authenticated();

        if (!(user instanceof Customer owner)) {
            throw new ForbiddenException("Acesso negado. Apenas clientes podem cadastrar pets.");
        }

        Breed breed = breedService.findEntityById(dto.getBreedId());

        Pet pet = new Pet();
        pet.setName(dto.getName());
        pet.setBirthDate(dto.getBirthDate());
        pet.setNotes(dto.getNotes());
        pet.setOwner(owner);
        pet.setBreed(breed);

        pet = petRepository.save(pet);
        return new PetDTO(pet);
    }

    /**
     * Cria um pet no contexto administrativo (especificando o owner).
     */
    @Transactional
    public PetDTO adminCreatePet(PetAdminInsertDTO dto) {
        Customer owner = customerRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o ID: " + dto.getOwnerId()));

        Breed breed = breedService.findEntityById(dto.getBreedId());

        Pet pet = new Pet();
        pet.setName(dto.getName());
        pet.setBirthDate(dto.getBirthDate());
        pet.setNotes(dto.getNotes());
        pet.setOwner(owner);
        pet.setBreed(breed);

        pet = petRepository.save(pet);
        return new PetDTO(pet);
    }

    /**
     * Atualiza um pet existente (campos fornecidos no DTO). Valida permissão (self ou admin).
     */
    @Transactional
    public PetDTO update(Long id, PetUpdateDTO dto) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet não encontrado com o ID: " + id));

        if (!authService.isSelfOrAdmin(pet.getOwner().getId())) {
            throw new ForbiddenException("Acesso negado.");
        }

        if (dto.getName() != null) {
            pet.setName(dto.getName());
        }
        if (dto.getBirthDate() != null) {
            pet.setBirthDate(dto.getBirthDate());
        }
        if (dto.getNotes() != null) {
            pet.setNotes(dto.getNotes());
        }
        if (dto.getBreedId() != null) {
            Breed breed = breedService.findEntityById(dto.getBreedId());
            pet.setBreed(breed);
        }

        Pet updatedPet = petRepository.save(pet);
        return new PetDTO(updatedPet);
    }

    /**
     * "Remove" um pet logicamente (marca como inativo). Valida permissão (self ou admin).
     */
    @Transactional
    public void delete(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet não encontrado com o ID: " + id));

        if (!authService.isSelfOrAdmin(pet.getOwner().getId())) {
            throw new ForbiddenException("Acesso negado.");
        }

        pet.setAtivo(false);
        petRepository.save(pet);
    }
}
