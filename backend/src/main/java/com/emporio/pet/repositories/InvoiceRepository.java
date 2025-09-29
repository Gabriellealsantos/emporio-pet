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
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    /**
     * Soma o valor total de faturas pagas dentro de um intervalo de datas.
     */
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = :status AND i.timestamp BETWEEN :start AND :end")
    BigDecimal sumPaidInvoicesByDate(InvoiceStatus status, Instant start, Instant end);


    /**
     * Busca faturas filtrando por cliente, intervalo de datas e status.
     */
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
            @Param("status") InvoiceStatus status
    );

    /**
     * Busca faturas filtrando pelo nome do cliente, intervalo de datas e status.
     */
    @Query(value = "SELECT i FROM Invoice i JOIN i.customer c WHERE " +
            "(:customerName IS NULL OR UPPER(c.name) LIKE UPPER(CONCAT('%', :customerName, '%'))) AND " +
            "(:minDate IS NULL OR i.timestamp >= :minDate) AND " +
            "(:maxDate IS NULL OR i.timestamp <= :maxDate) AND " +
            "(:status IS NULL OR i.status = :status)",

            countQuery = "SELECT COUNT(i) FROM Invoice i JOIN i.customer c WHERE " +
                    "(:customerName IS NULL OR UPPER(c.name) LIKE UPPER(CONCAT('%', :customerName, '%'))) AND " +
                    "(:minDate IS NULL OR i.timestamp >= :minDate) AND " +
                    "(:maxDate IS NULL OR i.timestamp <= :maxDate) AND " +
                    "(:status IS NULL OR i.status = :status)")
    Page<Invoice> findFiltered(
            Pageable pageable,
            @Param("customerName") String customerName,
            @Param("minDate") Instant minDate,
            @Param("maxDate") Instant maxDate,
            @Param("status") InvoiceStatus status
    );


    /**
     * Busca fatura com cliente, pets, serviços e agendamentos já carregados.
     */
    @Query("SELECT i FROM Invoice i " +
            "JOIN FETCH i.customer c " +
            "JOIN FETCH i.appointments a " +
            "JOIN FETCH a.pet p " +
            "JOIN FETCH a.service s " +
            "WHERE i.id = :id")
    Optional<Invoice> findByIdWithDetails(@Param("id") Long id);

    /**
     * Retorna as últimas 5 faturas de um determinado status.
     */
    List<Invoice> findTop5ByStatusOrderByTimestampDesc(InvoiceStatus status);

    /**
     * Busca faturas filtrando por nome OU CPF do cliente, intervalo de datas e status.
     * Esta é uma consulta mista que lida com ambos os cenários.
     */
    @Query(value = "SELECT i FROM Invoice i JOIN i.customer c WHERE " +
            "(:customerName IS NULL OR UPPER(c.name) LIKE UPPER(CONCAT('%', :customerName, '%'))) AND " +
            "(:customerCpf IS NULL OR c.cpf LIKE CONCAT('%', :customerCpf, '%')) AND " +
            "(:minDate IS NULL OR i.timestamp >= :minDate) AND " +
            "(:maxDate IS NULL OR i.timestamp <= :maxDate) AND " +
            "(:status IS NULL OR i.status = :status)",

            countQuery = "SELECT COUNT(i) FROM Invoice i JOIN i.customer c WHERE " +
                    "(:customerName IS NULL OR UPPER(c.name) LIKE UPPER(CONCAT('%', :customerName, '%'))) AND " +
                    "(:customerCpf IS NULL OR c.cpf LIKE CONCAT('%', :customerCpf, '%')) AND " +
                    "(:minDate IS NULL OR i.timestamp >= :minDate) AND " +
                    "(:maxDate IS NULL OR i.timestamp <= :maxDate) AND " +
                    "(:status IS NULL OR i.status = :status)")
    Page<Invoice> findFiltered(
            Pageable pageable,
            @Param("customerName") String customerName,
            @Param("customerCpf") String customerCpf,
            @Param("minDate") Instant minDate,
            @Param("maxDate") Instant maxDate,
            @Param("status") InvoiceStatus status
    );
}
