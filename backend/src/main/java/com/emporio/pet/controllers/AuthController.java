package com.emporio.pet.controllers;

import com.emporio.pet.dto.ForgotPasswordDTO;
import com.emporio.pet.dto.LoginRequestDTO;
import com.emporio.pet.dto.LoginResponseDTO;
import com.emporio.pet.dto.MessageDTO;
import com.emporio.pet.dto.ResetPasswordDTO;
import com.emporio.pet.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO request) {
        String token = authService.login(request);
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<MessageDTO> forgotPassword(@RequestBody @Valid ForgotPasswordDTO body) {
        return ResponseEntity.ok(authService.createRecoverToken(body.getEmail()));
    }

    @PostMapping("/new-password")
    public ResponseEntity<MessageDTO> resetPassword(@RequestBody @Valid ResetPasswordDTO body) {
        return ResponseEntity.ok(authService.saveNewPassword(body.getToken(), body.getNewPassword()));
    }
}