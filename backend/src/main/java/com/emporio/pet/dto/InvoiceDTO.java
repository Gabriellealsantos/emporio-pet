package com.emporio.pet.dto;

import com.emporio.pet.entities.Invoice;
import com.emporio.pet.entities.enums.InvoiceStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

public class InvoiceDTO {

    private Long id;
    private Instant timestamp;
    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private Long customerId;
    private List<AppointmentDTO> appointments;

    public InvoiceDTO(Invoice entity) {
        this.id = entity.getId();
        this.timestamp = entity.getTimestamp();
        this.totalAmount = entity.getTotalAmount();
        this.status = entity.getStatus();
        this.customerId = entity.getCustomer().getId();
        this.appointments = entity.getAppointments().stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public Instant getTimestamp() { return timestamp; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public InvoiceStatus getStatus() { return status; }
    public Long getCustomerId() { return customerId; }
    public List<AppointmentDTO> getAppointments() { return appointments; }
}