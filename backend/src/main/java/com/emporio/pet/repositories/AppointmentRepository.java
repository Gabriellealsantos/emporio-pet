package com.emporio.pet.repositories;

import com.emporio.pet.entities.Appointment;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.Employee;
import com.emporio.pet.entities.Pet;
import com.emporio.pet.entities.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT obj FROM Appointment obj JOIN FETCH obj.service WHERE " +
            "obj.employee IN :employees " +
            "AND obj.startDateTime < :endOfDay " +
            "AND obj.endDateTime > :startOfDay " +
            "AND obj.status NOT IN :statusesToExclude")
    List<Appointment> findAppointmentsForEmployeesInInterval(
            List<Employee> employees, LocalDateTime startOfDay, LocalDateTime endOfDay, List<AppointmentStatus> statusesToExclude);


    @Query(value = "SELECT a FROM Appointment a " +
            "JOIN FETCH a.pet p " +
            "JOIN FETCH p.owner " +
            "JOIN FETCH a.service s " +
            "LEFT JOIN FETCH a.review r " +
            "WHERE (:employeeId IS NULL OR a.employee.id = :employeeId) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:minDate IS NULL OR a.startDateTime >= :minDate) AND " +
            "(:maxDate IS NULL OR a.startDateTime <= :maxDate) " +
            "ORDER BY a.startDateTime DESC",
            countQuery = "SELECT COUNT(a) FROM Appointment a WHERE " +
                    "(:employeeId IS NULL OR a.employee.id = :employeeId) AND " +
                    "(:status IS NULL OR a.status = :status) AND " +
                    "(:minDate IS NULL OR a.startDateTime >= :minDate) AND " +
                    "(:maxDate IS NULL OR a.startDateTime <= :maxDate)")
    Page<Appointment> findAppointmentsByFilter(
            @Param("minDate") LocalDateTime minDate,
            @Param("maxDate") LocalDateTime maxDate,
            @Param("employeeId") Long employeeId,
            @Param("status") AppointmentStatus status,
            Pageable pageable);

    Integer countByStartDateTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.pet.owner.id = :customerId AND a.status = 'COMPLETED' AND a.invoice IS NULL ORDER BY a.startDateTime ASC")
    List<Appointment> findFaturableAppointmentsByCustomer(@Param("customerId") Long customerId);

    @Query(value = "SELECT a FROM Appointment a " +
            "JOIN FETCH a.pet p " +
            "JOIN FETCH a.service " +
            "WHERE a.pet IN :pets " +
            "ORDER BY a.startDateTime DESC",
            countQuery = "SELECT COUNT(a) FROM Appointment a WHERE a.pet IN :pets")
    Page<Appointment> findByPetInOrderByStartDateTimeDesc(@Param("pets") List<Pet> pets, Pageable pageable);

    @Query(value = "SELECT a FROM Appointment a " +
            "JOIN FETCH a.pet p " +
            "JOIN FETCH a.service " +
            "WHERE a.pet IN :pets " +
            "AND (:minDate IS NULL OR a.startDateTime >= :minDate) " +
            "AND (:maxDate IS NULL OR a.startDateTime <= :maxDate) " +
            "AND (:status IS NULL OR a.status = :status) " +
            "ORDER BY a.startDateTime DESC",
            countQuery = "SELECT COUNT(a) FROM Appointment a WHERE a.pet IN :pets " +
                    "AND (:minDate IS NULL OR a.startDateTime >= :minDate) " +
                    "AND (:maxDate IS NULL OR a.startDateTime <= :maxDate) " +
                    "AND (:status IS NULL OR a.status = :status)")
    Page<Appointment> findAppointmentsByPetsAndDateRange(
            @Param("pets") List<Pet> pets,
            @Param("minDate") LocalDateTime minDate,
            @Param("maxDate") LocalDateTime maxDate,
            @Param("status") AppointmentStatus status, // <-- PARÂMETRO ADICIONADO
            Pageable pageable);

    List<Appointment> findTop5ByOrderByStartDateTimeDesc();

    List<Appointment> findByPetInAndStartDateTimeAfterOrderByStartDateTimeAsc(List<Pet> pets, LocalDateTime now);
}