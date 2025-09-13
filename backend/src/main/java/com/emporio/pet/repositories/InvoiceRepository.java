package com.emporio.pet.repositories;

import com.emporio.pet.entities.Invoice;
import com.emporio.pet.entities.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = :status AND i.timestamp BETWEEN :start AND :end")
    BigDecimal sumPaidInvoicesByDate(InvoiceStatus status, Instant start, Instant end);

    @Query(value = "SELECT i FROM Invoice i WHERE " +
            "(:customerId IS NULL OR i.customer.id = :customerId) AND " +
            "(:minDate IS NULL OR i.timestamp >= :minDate) AND " +
            "(:maxDate IS NULL OR i.timestamp <= :maxDate) AND " +
            "(:status IS NULL OR i.status = :status)",

            countQuery = "SELECT COUNT(i) FROM Invoice i WHERE " +
                    "(:customerId IS NULL OR i.customer.id = :customerId) AND " +
                    "(:minDate IS NULL OR i.timestamp >= :minDate) AND " +
                    "(:maxDate IS NULL OR i.timestamp <= :maxDate) AND " +
                    "(:status IS NULL OR i.status = :status)")
    Page<Invoice> findFiltered(
            Pageable pageable,
            @Param("customerId") Long customerId,
            @Param("minDate") Instant minDate,
            @Param("maxDate") Instant maxDate,
            @Param("status") InvoiceStatus status);
}
