package com.emporio.pet.repositories;

import com.emporio.pet.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCpf(String cpf);

    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.pets p LEFT JOIN FETCH p.breed WHERE c.id = :id")
    Optional<Customer> findByIdWithPets(@Param("id") Long id);
}