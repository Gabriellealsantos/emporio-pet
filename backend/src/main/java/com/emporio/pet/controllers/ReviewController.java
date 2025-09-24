package com.emporio.pet.controllers;

import com.emporio.pet.dto.ReviewDTO;
import com.emporio.pet.dto.ReviewInsertDTO;
import com.emporio.pet.services.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews") // ✅ Ótima ideia: Define o caminho base para todas as rotas de review
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/for-appointment/{appointmentId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ReviewDTO> create(
            @PathVariable Long appointmentId,
            @Valid @RequestBody ReviewInsertDTO dto) {

        ReviewDTO createdDto = reviewService.create(dto, appointmentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDto);
    }

    @GetMapping("/by-service/{serviceId}")
    public ResponseEntity<List<ReviewDTO>> findByService(@PathVariable Long serviceId) {
        List<ReviewDTO> reviewList = reviewService.findByService(serviceId);
        return ResponseEntity.ok(reviewList);
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> adminDeleteReview(@PathVariable Long id) {
        reviewService.adminDeleteComment(id);
        return ResponseEntity.noContent().build();
    }
}