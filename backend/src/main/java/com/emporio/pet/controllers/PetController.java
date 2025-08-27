package com.emporio.pet.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.emporio.pet.services.PetService;
import com.emporio.pet.dto.PetDTO;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @PostMapping("/cadastrar")
    public PetDTO cadastrarPet(@RequestBody PetDTO petDTO) {
        return petService.createPet(petDTO);
    }

    @GetMapping("/cliente/{customerId}")
    public List<PetDTO> listarPets(@PathVariable Long customerId) {
        return petService.listPetsbyOwner(customerId);
    }

    @GetMapping("/{id}")
    public PetDTO buscarPet(@PathVariable Long id) {
        return petService.searchbyId(id);
    }

    @PostMapping("/editar/{id}")
    public PetDTO editarPet(@PathVariable Long id, @RequestBody PetDTO petDTO) {
        return petService.editPet(id, petDTO);
    }

    @PostMapping("/remover/{id}")
    public void removerPet(@PathVariable Long id) {
        petService.removePet(id);
    }
}
