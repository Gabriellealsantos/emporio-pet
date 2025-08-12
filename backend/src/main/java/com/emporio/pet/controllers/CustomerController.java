package com.emporio.pet.controllers;

import com.emporio.pet.dto.CustomerDTO;
import com.emporio.pet.dto.CustomerInsertDTO;
import com.emporio.pet.dto.CustomerUpdateDTO;
import com.emporio.pet.services.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping(value = "/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<CustomerDTO> register(@Valid @RequestBody CustomerInsertDTO dto) {
        CustomerDTO newDto = customerService.register(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getCustomerId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> update(@PathVariable Long id, @Valid @RequestBody CustomerUpdateDTO dto) {
        CustomerDTO updatedDto = customerService.update(id, dto);
        return ResponseEntity.ok(updatedDto);
    }

}