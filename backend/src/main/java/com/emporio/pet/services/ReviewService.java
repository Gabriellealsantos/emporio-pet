package com.emporio.pet.services;

import com.emporio.pet.dto.ReviewDTO;
import com.emporio.pet.dto.ReviewInsertDTO;
import com.emporio.pet.entities.Appointment;
import com.emporio.pet.entities.Review;
import com.emporio.pet.entities.User;
import com.emporio.pet.entities.enums.AppointmentStatus;
import com.emporio.pet.repositories.AppointmentRepository;
import com.emporio.pet.repositories.ReviewRepository;
import com.emporio.pet.services.exceptions.ConflictException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuthService authService;

    public ReviewService(ReviewRepository reviewRepository, AppointmentRepository appointmentRepository, AuthService authService) {
        this.reviewRepository = reviewRepository;
        this.appointmentRepository = appointmentRepository;
        this.authService = authService;
    }


    /**
     * Busca todas as avaliações associadas a um serviço específico.
     */
    @Transactional(readOnly = true)
    public List<ReviewDTO> findByService(Long serviceId) {
        List<Review> reviews = reviewRepository.findByAppointmentServiceId(serviceId);
        return reviews.stream().map(ReviewDTO::new).collect(Collectors.toList());
    }


    /**
     * Cria uma avaliação para um agendamento concluído,
     * garantindo que o usuário só possa avaliar seus próprios agendamentos
     * e que ainda não exista uma avaliação para o mesmo agendamento.
     */
    @Transactional
    public ReviewDTO create(ReviewInsertDTO dto, Long appointmentId) {
        User user = authService.authenticated();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado."));

        if (!user.getId().equals(appointment.getPet().getOwner().getId())) {
            throw new ForbiddenException("Acesso negado. Você só pode avaliar seus próprios agendamentos.");
        }

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new ConflictException("Só é possível avaliar agendamentos que já foram concluídos.");
        }

        if (reviewRepository.existsById(appointmentId)) {
            throw new ConflictException("Este agendamento já foi avaliado.");
        }

        Review review = new Review();
        review.setAppointment(appointment);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setReviewDate(Instant.now());

        review = reviewRepository.save(review);
        return new ReviewDTO(review);
    }


    /**
     * Permite que um administrador remova o conteúdo de um comentário de avaliação,
     * substituindo-o por uma mensagem padrão.
     */
    @Transactional
    public void adminDeleteComment(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada com o ID: " + reviewId));

        review.setComment("Comentário removido por um administrador.");
        reviewRepository.save(review);
    }
}
