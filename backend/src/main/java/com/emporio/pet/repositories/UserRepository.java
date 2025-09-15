package com.emporio.pet.repositories;

import com.emporio.pet.entities.User;
import com.emporio.pet.entities.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"roles"})
    Page<User> findAll(Specification<User> spec, Pageable pageable);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE " +
            "(:name IS NULL OR UPPER(u.name) LIKE UPPER(CONCAT('%', :name, '%'))) AND " + // <-- MUDANÇA AQUI
            "(:status IS NULL OR u.userStatus = :status) AND " +
            "r.authority = :role")
    Page<User> findByNameAndRole(
            @Param("name") String name,
            @Param("status") UserStatus status,
            @Param("role") String role,
            Pageable pageable
    );

    @Query("SELECT u FROM User u JOIN u.roles r WHERE " +
            "TYPE(u) = Customer AND TREAT(u AS Customer).cpf LIKE CONCAT('%', :cpf, '%') AND " +
            "(:status IS NULL OR u.userStatus = :status) AND " +
            "r.authority = :role")
    Page<User> findByCpfAndRole(
            @Param("cpf") String cpf,
            @Param("status") UserStatus status,
            @Param("role") String role,
            Pageable pageable
    );
}