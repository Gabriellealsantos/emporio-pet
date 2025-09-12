package com.emporio.pet.controllers;

import com.emporio.pet.dto.AppointmentDTO;
import com.emporio.pet.dto.AppointmentInsertDTO;
import com.emporio.pet.dto.AppointmentStatusUpdateDTO;
import com.emporio.pet.entities.enums.AppointmentStatus;
import com.emporio.pet.services.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/availability")
    public ResponseEntity<List<LocalDateTime>> findAvailability(
            @RequestParam Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long employeeId) {

        List<LocalDateTime> availableTimes = appointmentService.findAvailableTimes(serviceId, date, employeeId);
        return ResponseEntity.ok(availableTimes);
    }

    @PostMapping
    public ResponseEntity<AppointmentDTO> create(@Valid @RequestBody AppointmentInsertDTO dto) {
        AppointmentDTO newDto = appointmentService.create(dto);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();

        return ResponseEntity.created(uri).body(newDto);
    }

    @GetMapping("/my")
    public ResponseEntity<List<AppointmentDTO>> findMyAppointments() {
        List<AppointmentDTO> list = appointmentService.findMyAppointments();
        return ResponseEntity.ok(list);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<Page<AppointmentDTO>> findAppointmentsByDate(
            @RequestParam(value = "minDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate minDate,
            @RequestParam(value = "maxDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate maxDate,
            @RequestParam(value = "employeeId", required = false) Long employeeId,
            @RequestParam(value = "status", required = false) AppointmentStatus status,
            Pageable pageable) { // Pageable é injetado automaticamente

        Page<AppointmentDTO> page = appointmentService.findAppointmentsByDate(minDate, maxDate, employeeId, status, pageable);
        return ResponseEntity.ok(page);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_ADMIN')")
    public ResponseEntity<AppointmentDTO> updateStatus(@PathVariable Long id, @Valid @RequestBody AppointmentStatusUpdateDTO dto) {
        AppointmentDTO updatedDto = appointmentService.updateStatus(id, dto.getNewStatus());
        return ResponseEntity.ok(updatedDto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        appointmentService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}