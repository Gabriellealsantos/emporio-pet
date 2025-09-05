package com.emporio.pet.repositories;

import com.emporio.pet.entities.Appointment;
import com.emporio.pet.entities.Employee;
import com.emporio.pet.entities.Pet;
import com.emporio.pet.entities.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.pet p " +
            "JOIN FETCH p.breed " +
            "JOIN FETCH a.service " +
            "JOIN FETCH a.employee e " +
            "LEFT JOIN FETCH e.roles " +
            "LEFT JOIN FETCH a.invoice " +
            "LEFT JOIN FETCH a.review " +
            "WHERE (:employeeId IS NULL OR a.employee.id = :employeeId) AND " +
            "a.startDateTime >= :minDate AND " +
            "a.endDateTime <= :maxDate " +
            "ORDER BY a.startDateTime ASC")
    List<Appointment> findAppointmentsByFilter(
            @Param("minDate") LocalDateTime minDate,
            @Param("maxDate") LocalDateTime maxDate,
            @Param("employeeId") Long employeeId);

}