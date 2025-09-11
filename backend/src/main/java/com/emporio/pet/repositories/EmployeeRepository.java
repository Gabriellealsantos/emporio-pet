package com.emporio.pet.repositories;

import com.emporio.pet.entities.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;


public interface EmployeeRepository extends JpaRepository<Employee, Long> {


    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.skilledServices WHERE e.id = :id")
    Optional<Employee> findByIdWithServices(Long id);
}