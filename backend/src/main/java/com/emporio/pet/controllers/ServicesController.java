package com.emporio.pet.controllers;

import com.emporio.pet.dto.EmployeeDTO;
import com.emporio.pet.dto.ServicesDTO;
import com.emporio.pet.dto.ServicesInsertDTO;
import com.emporio.pet.dto.ServicesUpdateDTO;
import com.emporio.pet.services.ServicesService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ServicesDTO> create(@Valid @RequestBody ServicesInsertDTO dto) {
        ServicesDTO serviceDTO = servicesService.createService(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(serviceDTO.getId()).toUri();
        return ResponseEntity.created(uri).body(serviceDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}")
    public ResponseEntity<ServicesDTO> update(@PathVariable Long id, @Valid @RequestBody ServicesUpdateDTO dto) {
        return ResponseEntity.ok(servicesService.update(id, dto));
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        servicesService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id) {
        servicesService.activate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/employees")
    public ResponseEntity<List<EmployeeDTO>> findQualifiedEmployees(@PathVariable Long id) {
        List<EmployeeDTO> qualifiedEmployees = servicesService.findQualifiedEmployees(id);
        return ResponseEntity.ok(qualifiedEmployees);
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> uploadServiceImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        servicesService.saveImage(id, file);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ServicesDTO>> findFeatured() {
        List<ServicesDTO> featuredServices = servicesService.findAllFeatured();
        return ResponseEntity.ok(featuredServices);
    }
}