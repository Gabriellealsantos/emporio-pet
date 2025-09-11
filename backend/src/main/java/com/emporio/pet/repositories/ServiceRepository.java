package com.emporio.pet.repositories;

import com.emporio.pet.entities.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Services, Long> {

    List<Services> findByActiveTrue();

    @Query("SELECT s FROM Services s " +
            "LEFT JOIN FETCH s.qualifiedEmployees e " +
            "LEFT JOIN FETCH e.roles " +
            "WHERE s.id = :id")
    Optional<Services> findByIdWithQualifiedEmployees(@Param("id") Long id);
}