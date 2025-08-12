package com.emporio.pet.services;

import com.emporio.pet.dto.*;
import com.emporio.pet.entities.*;
import com.emporio.pet.entities.enums.UserStatus;
import com.emporio.pet.factory.UserFactory;
import com.emporio.pet.repositories.*;
import com.emporio.pet.services.exceptions.DatabaseException;
import com.emporio.pet.services.exceptions.EmailException;
import com.emporio.pet.services.exceptions.UsernameNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordRecoverRepository passwordRecoverRepository;
    private final JavaMailSender emailSender;
    private final EmployeeRepository employeeRepository;

    @Value("${email.password-recover.token.minutes}")
    private Long tokenMinutes;
    @Value("${email.password-recover.uri}")
    private String recoverUri;

    public AuthService(UserRepository userRepository, CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService,
                       PasswordRecoverRepository passwordRecoverRepository, JavaMailSender emailSender, EmployeeRepository employeeRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordRecoverRepository = passwordRecoverRepository;
        this.emailSender = emailSender;
        this.employeeRepository = employeeRepository;
    }


    public String login(LoginRequestDTO dto) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword());
        Authentication auth = this.authenticationManager.authenticate(usernamePassword);
        return jwtService.generateToken(auth);
    }

    public User authenticated() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            return userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("Usuário inválido"));
        }
        catch (Exception e) {
            throw new UsernameNotFoundException("Usuário inválido");
        }
    }

    public boolean isSelfOrAdminByCustomerId(Long customerId) {
        User authenticatedUser = authenticated();

        if (authenticatedUser.hasRole("ROLE_ADMIN")) {
            return true;
        }

        Customer customer = customerRepository.findById(customerId).orElse(null);
        return customer != null && customer.getUser().getId().equals(authenticatedUser.getId());
    }

    public boolean isSelfOrAdminByEmployeeId(Long employeeId) {
        User authenticatedUser = authenticated();

        if (authenticatedUser.hasRole("ROLE_ADMIN")) {
            return true;
        }

        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        return employee != null && employee.getUser().getId().equals(authenticatedUser.getId());
    }

    @Transactional
    public MessageDTO createRecoverToken(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            PasswordRecover entity = new PasswordRecover();
            entity.setEmail(email);
            entity.setToken(token);
            entity.setExpiration(Instant.now().plus(tokenMinutes, ChronoUnit.MINUTES));
            passwordRecoverRepository.save(entity);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Recuperação de Senha - Empório Pet");
            message.setText("Para redefinir sua senha, clique no link abaixo:\n\n" + recoverUri + token);
            emailSender.send(message);
        });

        String message = "Caso o e-mail exista em nossa base de dados, um link de recuperação foi enviado.";
        return new MessageDTO(message);
    }

    @Transactional
    public MessageDTO saveNewPassword(String token, String newPassword) {
        PasswordRecover recoverEntity = passwordRecoverRepository.searchValidToken(token, Instant.now());
        if (recoverEntity == null) {
            throw new IllegalArgumentException("Token inválido ou expirado.");
        }

        User user = userRepository.findByEmail(recoverEntity.getEmail())
                .orElseThrow(() -> new EmailException("Email não encontrado"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordRecoverRepository.delete(recoverEntity);


        String message = "Senha alterada com sucesso!";
        return new MessageDTO(message);
    }
}