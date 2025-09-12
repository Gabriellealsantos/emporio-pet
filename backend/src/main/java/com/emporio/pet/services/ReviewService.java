package com.emporio.pet.services;

import com.emporio.pet.dto.ReviewDTO;
import com.emporio.pet.dto.ReviewInsertDTO;
import com.emporio.pet.entities.Appointment;
import com.emporio.pet.entities.Customer;
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

    @Transactional
    public ReviewDTO create(ReviewInsertDTO dto, Long appointmentId) {
        User user = authService.authenticated();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado."));

        // 3. REGRA DE NEGÓCIO: Segurança
        // Garante que o usuário logado é o dono do pet daquele agendamento.
        if (!user.getId().equals(appointment.getPet().getOwner().getId())) {
            throw new ForbiddenException("Acesso negado. Você só pode avaliar seus próprios agendamentos.");
        }

        // 4. REGRA DE NEGÓCIO: Status do Agendamento
        // Garante que o agendamento foi de fato concluído.
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new ConflictException("Só é possível avaliar agendamentos que já foram concluídos.");
        }

        // 5. REGRA DE NEGÓCIO: Avaliação Única
        // Garante que este agendamento ainda não foi avaliado.
        if (reviewRepository.existsById(appointmentId)) {
            throw new ConflictException("Este agendamento já foi avaliado.");
        }

        // 6. Se todas as regras passaram, cria e salva a nova avaliação.
        Review review = new Review();
        review.setAppointment(appointment); // Associa a avaliação ao agendamento
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setReviewDate(Instant.now());

        review = reviewRepository.save(review);
        return new ReviewDTO(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> findByService(Long serviceId) {
        List<Review> reviews = reviewRepository.findByAppointmentServiceId(serviceId);
        return reviews.stream().map(ReviewDTO::new).collect(Collectors.toList());
    }
}