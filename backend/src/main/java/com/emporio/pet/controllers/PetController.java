package com.emporio.pet.controllers;

import com.emporio.pet.dto.PetAdminInsertDTO;
import com.emporio.pet.dto.PetDTO;
import com.emporio.pet.dto.PetInsertDTO;
import com.emporio.pet.dto.PetUpdateDTO;
import com.emporio.pet.services.PetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<PetDTO> create(@Valid @RequestBody PetInsertDTO dto) {
        PetDTO newDto = petService.createPet(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin")
    public ResponseEntity<PetDTO> adminCreate(@Valid @RequestBody PetAdminInsertDTO dto) {
        PetDTO newDto = petService.adminCreatePet(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @GetMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<PetDTO>> findMyPets() {
        List<PetDTO> list = petService.findMyPets();
        return ResponseEntity.ok(list);
    }

    @GetMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<PetDTO> findById(@PathVariable Long id) {
        PetDTO dto = petService.findById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<PetDTO> update(@PathVariable Long id, @Valid @RequestBody PetUpdateDTO dto) {
        PetDTO updatedDto = petService.update(id, dto);
        return ResponseEntity.ok(updatedDto);
    }
    @DeleteMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        petService.delete(id);
        return ResponseEntity.noContent().build();
    }
}