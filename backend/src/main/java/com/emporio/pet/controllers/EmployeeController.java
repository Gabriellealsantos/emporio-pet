package com.emporio.pet.controllers;

import com.emporio.pet.dto.EmployeeDTO;
import com.emporio.pet.dto.EmployeeInsertDTO;
import com.emporio.pet.dto.EmployeeUpdateDTO;
import com.emporio.pet.dto.ServiceAssociationDTO;
import com.emporio.pet.services.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping(value = "/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeDTO> create(@Valid @RequestBody EmployeeInsertDTO dto) {
        EmployeeDTO newDto = employeeService.create(dto);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();

        return ResponseEntity.created(uri).body(newDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDTO> update(@PathVariable Long id, @Valid @RequestBody EmployeeUpdateDTO dto) {
        EmployeeDTO updatedDto = employeeService.update(id, dto);
        return ResponseEntity.ok(updatedDto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{employeeId}/services")
    public ResponseEntity<EmployeeDTO> addService(@PathVariable Long employeeId, @Valid @RequestBody ServiceAssociationDTO dto) {
        EmployeeDTO updatedEmployee = employeeService.addServiceToEmployee(employeeId, dto.getServiceId());
        return ResponseEntity.ok(updatedEmployee);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{employeeId}/services/{serviceId}")
    public ResponseEntity<Void> removeService(@PathVariable Long employeeId, @PathVariable Long serviceId) {
        employeeService.removeServiceFromEmployee(employeeId, serviceId);
        return ResponseEntity.noContent().build();
    }
}