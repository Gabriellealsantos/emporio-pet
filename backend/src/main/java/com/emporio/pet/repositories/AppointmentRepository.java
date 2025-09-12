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

    @Query("SELECT obj FROM Appointment obj WHERE " +
            "obj.employee IN :employees " +
            "AND obj.startDateTime < :endOfDay " +
            "AND obj.endDateTime > :startOfDay " +
            "AND obj.status NOT IN :statusesToExclude")
    List<Appointment> findAppointmentsForEmployeesInInterval(
            List<Employee> employees, LocalDateTime startOfDay, LocalDateTime endOfDay, List<AppointmentStatus> statusesToExclude);

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.pet p " +
            "JOIN FETCH p.breed " +
            "JOIN FETCH a.service " +
            "JOIN FETCH a.employee e " +
            "LEFT JOIN FETCH e.roles " +
            "LEFT JOIN FETCH a.invoice " +
            "LEFT JOIN FETCH a.review " +
            "WHERE a.pet IN :pets " +
            "ORDER BY a.startDateTime DESC")
    List<Appointment> findByPetInOrderByStartDateTimeDesc(@Param("pets") List<Pet> pets);

    @Query(value = "SELECT a FROM Appointment a " +
            "JOIN FETCH a.pet p " +
            "JOIN FETCH a.service " +
            "JOIN FETCH a.employee e " +
            "WHERE (:employeeId IS NULL OR a.employee.id = :employeeId) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "a.startDateTime BETWEEN :minDate AND :maxDate " +
            "ORDER BY a.startDateTime ASC",
            countQuery = "SELECT COUNT(a) FROM Appointment a WHERE " +
                    "(:employeeId IS NULL OR a.employee.id = :employeeId) AND " +
                    "(:status IS NULL OR a.status = :status) AND " +
                    "a.startDateTime BETWEEN :minDate AND :maxDate")
    Page<Appointment> findAppointmentsByFilter(
            @Param("minDate") LocalDateTime minDate,
            @Param("maxDate") LocalDateTime maxDate,
            @Param("employeeId") Long employeeId,
            @Param("status") AppointmentStatus status,
            Pageable pageable);

    Integer countByStartDateTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(a.chargedAmount) FROM Appointment a WHERE a.status = 'COMPLETED' AND a.startDateTime BETWEEN :start AND :end")
    BigDecimal sumCompletedAppointmentsByDate(LocalDateTime start, LocalDateTime end);

    List<Appointment> findTop5ByOrderByStartDateTimeDesc();
}