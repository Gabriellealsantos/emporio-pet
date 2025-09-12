package com.emporio.pet.repositories;

import com.emporio.pet.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    @Query("SELECT r FROM Review r WHERE r.appointment.service.id = :serviceId")
    List<Review> findByAppointmentServiceId(Long serviceId);
}
