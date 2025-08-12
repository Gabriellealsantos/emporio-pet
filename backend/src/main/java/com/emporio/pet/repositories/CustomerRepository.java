package com.emporio.pet.repositories;

import com.emporio.pet.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCpf(String cpf);
    Optional<Customer> findByUserId(Long userId);

    List<Customer> findByUser_IdIn(List<Long> userIds);
}
