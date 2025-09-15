package com.emporio.pet.services;

import com.emporio.pet.dto.LoginRequestDTO;
import com.emporio.pet.dto.MessageDTO;
import com.emporio.pet.dto.PasswordChangeDTO;
import com.emporio.pet.entities.PasswordRecover;
import com.emporio.pet.entities.User;
import com.emporio.pet.repositories.InvoiceRepository;
import com.emporio.pet.repositories.PasswordRecoverRepository;
import com.emporio.pet.repositories.UserRepository;
import com.emporio.pet.services.exceptions.EmailException;
import com.emporio.pet.services.exceptions.UsernameNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordRecoverRepository passwordRecoverRepository;
    private final JavaMailSender emailSender;
    private final InvoiceRepository invoiceRepository;

    @Value("${email.password-recover.token.minutes}")
    private Long tokenMinutes;
    @Value("${email.password-recover.uri}")
    private String recoverUri;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService,
                       PasswordRecoverRepository passwordRecoverRepository, JavaMailSender emailSender, InvoiceRepository invoiceRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordRecoverRepository = passwordRecoverRepository;
        this.emailSender = emailSender;
        this.invoiceRepository = invoiceRepository;
    }


    public String login(LoginRequestDTO dto) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword());
        Authentication auth = this.authenticationManager.authenticate(usernamePassword);
        return jwtService.generateToken(auth);
    }

    @Transactional(readOnly = true)
    public boolean canAccessInvoice(Long invoiceId) {
        User authenticatedUser = authenticated();

        // Se for admin ou funcionário, sempre pode acessar.
        if (authenticatedUser.hasRole("ROLE_ADMIN") || authenticatedUser.hasRole("ROLE_EMPLOYEE")) {
            return true;
        }

        return invoiceRepository.findById(invoiceId)
                .map(invoice -> invoice.getCustomer().getId().equals(authenticatedUser.getId()))
                .orElse(false);
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

    public boolean isSelfOrAdmin(Long userId) {
        User authenticatedUser = authenticated();
        return authenticatedUser.hasRole("ROLE_ADMIN") || authenticatedUser.getId().equals(userId);
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

    @Transactional
    public void changePassword(PasswordChangeDTO dto) {
        User user = authenticated();

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Senha atual incorreta.");
        }


        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }
}