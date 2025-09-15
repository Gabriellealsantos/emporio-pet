package com.emporio.pet.controllers;

import com.emporio.pet.dto.InvoiceCreateDTO;
import com.emporio.pet.dto.InvoiceDTO;
import com.emporio.pet.entities.enums.InvoiceStatus;
import com.emporio.pet.services.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;


import java.net.URI;
import java.time.Instant;

@RestController
@RequestMapping("/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN', 'CLIENT')")
    public ResponseEntity<InvoiceDTO> findById(@PathVariable Long id) {
        InvoiceDTO dto = invoiceService.findById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN', 'CLIENT')")
    public ResponseEntity<Page<InvoiceDTO>> find(
            Pageable pageable,
            @RequestParam(value = "customerName", required = false) String customerName,
            @RequestParam(value = "minDate", required = false) Instant minDate,
            @RequestParam(value = "maxDate", required = false) Instant maxDate,
            @RequestParam(value = "status", required = false) InvoiceStatus status) {

        Page<InvoiceDTO> page = invoiceService.find(pageable, customerName, minDate, maxDate, status);
        return ResponseEntity.ok(page);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<InvoiceDTO> create(@Valid @RequestBody InvoiceCreateDTO dto) {
        InvoiceDTO newDto = invoiceService.create(dto);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();

        return ResponseEntity.created(uri).body(newDto);
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<InvoiceDTO> markAsPaid(@PathVariable Long id) {
        InvoiceDTO updatedDto = invoiceService.markAsPaid(id);
        return ResponseEntity.ok(updatedDto);
    }
}