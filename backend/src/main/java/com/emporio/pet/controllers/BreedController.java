package com.emporio.pet.controllers;

import com.emporio.pet.dto.BreedDTO;
import com.emporio.pet.entities.enums.Species;
import com.emporio.pet.services.BreedService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/breeds")
public class BreedController {

    private final BreedService breedService;

    public BreedController(BreedService breedService) {
        this.breedService = breedService;
    }

    @GetMapping
    public ResponseEntity<List<BreedDTO>> findAll(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "species", required = false) Species species) {
        return ResponseEntity.ok(breedService.findAll(name, species));
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<BreedDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(breedService.findById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<BreedDTO> create(@Valid @RequestBody BreedDTO dto) {
        dto = breedService.create(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(dto.getId()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}")
    public ResponseEntity<BreedDTO> update(@PathVariable Long id, @Valid @RequestBody BreedDTO dto) {
        return ResponseEntity.ok(breedService.update(id, dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        breedService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/species")
    public ResponseEntity<Species[]> findAllSpecies() {
        return ResponseEntity.ok(Species.values());
    }
}