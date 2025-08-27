package com.emporio.pet.services;

import com.emporio.pet.dto.PetDTO;
//import com.emporio.pet.entities.Customer;
//import com.emporio.pet.dto.BreedDTO;
import com.emporio.pet.entities.Pet;
import com.emporio.pet.repositories.PetRepository;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class PetService {

    private final PetRepository petRepository;

    public PetService(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    public PetDTO createPet(PetDTO dto) {

        Pet pet = new Pet();
        //IMCOMPLETO, FALTA SETAR O DONO E A RAÇA
        pet.setName(dto.getName());

        pet.setBirthDate(dto.getBirthDate());
        pet.setNotes(dto.getNotes());
        Pet savedPet = petRepository.save(pet);
        return new PetDTO(savedPet);
    }
    
    public List<PetDTO> listPetsbyOwner(Long customerId) {
        List<Pet> pets = petRepository.findByOwnerId(customerId);
        return pets.stream().map(PetDTO::new).collect(Collectors.toList());
    }


   public PetDTO searchbyId(Long id) {
        Pet pet = petRepository.findById(id).orElseThrow(() -> new RuntimeException("Pet not found"));
        return new PetDTO(pet);
    }


    public PetDTO editPet(Long id, PetDTO dto) {
        //IMCOMPLETO, FALTA EDITAR O DONO E A RAÇA
        Pet pet = petRepository.findById(id).orElseThrow(() -> new RuntimeException("Pet not found"));
        pet.setName(dto.getName());
        pet.setBirthDate(dto.getBirthDate());
        pet.setNotes(dto.getNotes());
        Pet updatedPet = petRepository.save(pet);
        return new PetDTO(updatedPet);
    }


    public void removePet(Long id) {
        petRepository.deleteById(id);
    }
}
