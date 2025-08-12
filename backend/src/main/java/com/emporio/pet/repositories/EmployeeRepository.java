package com.emporio.pet.repositories;

import com.emporio.pet.entities.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUserId(Long userId);

    List<Employee> findByUser_IdIn(List<Long> userIds);
}