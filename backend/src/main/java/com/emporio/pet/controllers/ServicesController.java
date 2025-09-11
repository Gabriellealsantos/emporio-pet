package com.emporio.pet.controllers;

import com.emporio.pet.dto.ServicesDTO;
import com.emporio.pet.dto.ServicesInsertDTO;
import com.emporio.pet.dto.ServicesUpdateDTO;
import com.emporio.pet.services.ServicesService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/services")
public class ServicesController {

    private final ServicesService servicesService;

    public ServicesController(ServicesService servicesService) {
        this.servicesService = servicesService;
    }

    @GetMapping
    public ResponseEntity<List<ServicesDTO>> findAll(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "active", required = false) Boolean active) {
        return ResponseEntity.ok(servicesService.findAll(name, active));
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<ServicesDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(servicesService.findById(id));
    }

    /**
     * JUSTIFICATIVA DE DESIGN:
     * Este endpoint atende ao requisito funcional de GERENCIAR serviços.
     * 1. SEGURANÇA: A anotação @PreAuthorize("hasRole('ADMIN')") garante que apenas
     * usuários com perfil de Administrador possam acessar este endpoint.
     * 2. PADRÃO REST: Utiliza o verbo POST e retorna o status 201 Created com a
     * localização do novo recurso, seguindo as melhores práticas.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ServicesDTO> create(@Valid @RequestBody ServicesInsertDTO dto) {
        ServicesDTO serviceDTO = servicesService.createService(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(serviceDTO.getId()).toUri();
        return ResponseEntity.created(uri).body(serviceDTO);
    }

    /**
     * JUSTIFICATIVA DE DESIGN:
     * Este endpoint atende ao requisito funcional de ATUALIZAR serviços.
     * 1. SEGURANÇA: Apenas administradores podem acessar este endpoint.
     * 2. PADRÃO REST: Utiliza o verbo PUT, semanticamente correto para a
     * atualização de recursos.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}")
    public ResponseEntity<ServicesDTO> update(@PathVariable Long id, @Valid @RequestBody ServicesUpdateDTO dto) {
        return ResponseEntity.ok(servicesService.update(id, dto));
    }

    /**
     * JUSTIFICATIVA DE DESIGN:
     * Este endpoint atende ao requisito funcional de DESATIVAR serviços.
     * 1. SEGURANÇA: Apenas administradores podem acessar este endpoint.
     * 2. PADRÃO REST: Utiliza o verbo DELETE e retorna o status 204 No Content,
     * semanticamente correto para operações de exclusão.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        servicesService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * JUSTIFICATIVA DE DESIGN:
     * Este endpoint atende ao requisito funcional de ATIVAR serviços previamente
     * desativados.
     * 1. SEGURANÇA: Apenas administradores podem acessar este endpoint.
     * 2. PADRÃO REST: Utiliza o verbo PUT, semanticamente correto para a reativação
     * de recursos.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id) {
        servicesService.activate(id);
        return ResponseEntity.noContent().build();
    }
}