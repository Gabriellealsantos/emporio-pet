package com.emporio.pet.repositories;

import com.emporio.pet.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Busca um cliente pelo CPF.
     */
    Optional<Customer> findByCpf(String cpf);

    /**
     * Busca um cliente com seus pets e raças já carregados.
     */
    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.pets p LEFT JOIN FETCH p.breed WHERE c.id = :id")
    Optional<Customer> findByIdWithPets(@Param("id") Long id);

    /**
     * Conta quantos clientes foram criados em um intervalo de tempo.
     */
    Integer countByCreationTimestampBetween(Instant start, Instant end);


    // ============================
    // Consultas rápidas/histórico
    // ============================

    /**
     * Retorna os 5 clientes mais recentes.
     */
    List<Customer> findTop5ByOrderByCreationTimestampDesc();
}
