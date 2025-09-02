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

    /**
     * JUSTIFICATIVA DE DESIGN:
     * Este endpoint de listagem (GET /breeds) é PÚBLICO. A decisão foi tomada porque
     * os clientes precisam ter acesso à lista de raças disponíveis para poderem
     * selecionar uma ao cadastrar ou editar um de seus pets.
     */
    @GetMapping
    public ResponseEntity<List<BreedDTO>> findAll() {
        return ResponseEntity.ok(breedService.findAll());
    }

    /**
     * JUSTIFICATIVA DE DESIGN:
     * Assim como a listagem, a busca por um ID de raça específica (GET /breeds/{id})
     * também é PÚBLICA, permitindo que a interface do cliente exiba detalhes
     * de uma raça, se necessário.
     */
    @GetMapping(value = "/{id}")
    public ResponseEntity<BreedDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(breedService.findById(id));
    }

    /**
     * JUSTIFICATIVA DE DESIGN:
     * [cite_start]Este endpoint atende ao requisito funcional RF16[cite: 21], que exige que administradores
     * possam GERENCIAR (Criar, Ler, Atualizar, Deletar) os dados de Raças.
     * 1. SEGURANÇA: A anotação @PreAuthorize("hasRole('ADMIN')") garante que apenas
     * usuários com perfil de Administrador possam acessar este endpoint.
     * 2. PADRÃO REST: Utiliza o verbo POST e retorna o status 201 Created com a
     * localização do novo recurso, seguindo as melhores práticas.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<BreedDTO> create(@Valid @RequestBody BreedDTO dto) {
        dto = breedService.create(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(dto.getId()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    /**
     * JUSTIFICATIVA DE DESIGN:
     * [cite_start]Atende ao requisito RF16 [cite: 21] para a operação de ATUALIZAR.
     * A segurança é garantida pela anotação @PreAuthorize("hasRole('ADMIN')").
     * Utiliza o verbo PUT, semanticamente correto para a atualização de recursos.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}")
    public ResponseEntity<BreedDTO> update(@PathVariable Long id, @Valid @RequestBody BreedDTO dto) {
        return ResponseEntity.ok(breedService.update(id, dto));
    }

    /**
     * JUSTIFICATIVA DE DESIGN:
     * [cite_start]Atende ao requisito RF16 [cite: 21] para a operação de DELETAR.
     * A segurança é garantida pela anotação @PreAuthorize("hasRole('ADMIN')").
     * Utiliza o verbo DELETE e retorna o status 204 No Content, seguindo os padrões REST.
     */
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