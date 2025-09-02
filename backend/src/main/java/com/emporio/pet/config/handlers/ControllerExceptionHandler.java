package com.emporio.pet.config.handlers;

import com.emporio.pet.controllers.exceptions.ValidationError;
import com.emporio.pet.services.exceptions.DatabaseException;
import com.emporio.pet.services.exceptions.EmailException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;

@ControllerAdvice
public class ControllerExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<StandardError> resourceNotFound(ResourceNotFoundException e, HttpServletRequest request) {
        return buildErrorResponse(e, "Resource not found", HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(DatabaseException.class)
    public ResponseEntity<StandardError> database(DatabaseException e, HttpServletRequest request) {
        return buildErrorResponse(e, "Database exception", HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(EmailException.class)
    public ResponseEntity<StandardError> email(EmailException e, HttpServletRequest request) {
        return buildErrorResponse(e, "Email exception", HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<StandardError> forbidden(ForbiddenException e, HttpServletRequest request) {
        return buildErrorResponse(e, "Forbidden", HttpStatus.FORBIDDEN, request);
    }


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<StandardError> illegalArgument(IllegalArgumentException e, HttpServletRequest request) {
        return buildErrorResponse(e, "Argumento inválido", HttpStatus.BAD_REQUEST, request);
    }

    // Dentro da classe ControllerExceptionHandler

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<StandardError> dataIntegrityViolation(DataIntegrityViolationException e, HttpServletRequest request) {
        String errorMessage = "Violação de integridade de dados.";
        String specificCause = e.getMostSpecificCause().getMessage().toUpperCase();

        if (specificCause.contains("TB_USER(EMAIL")) {
            errorMessage = "O email informado já está em uso.";
        } else if (specificCause.contains("TB_USER(CPF")) {
            errorMessage = "O CPF informado já está em uso.";
        } else if (specificCause.contains("TB_USER(PHONE")) {
            errorMessage = "O telefone informado já está em uso.";
        } else if (specificCause.contains("TB_BREED(NAME")) {
            errorMessage = "O nome da raça informado já existe.";
        }

        StandardError err = new StandardError();
        err.setTimestamp(Instant.now());
        err.setStatus(HttpStatus.BAD_REQUEST.value());
        err.setError("Data integrity violation");
        err.setMessage(errorMessage);
        err.setPath(request.getRequestURI());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationError> validation(MethodArgumentNotValidException e, HttpServletRequest request) {
        HttpStatus status = HttpStatus.UNPROCESSABLE_ENTITY;
        ValidationError err = new ValidationError();
        err.setTimestamp(Instant.now());
        err.setStatus(status.value());
        err.setError("Validation exception");
        err.setMessage("Dados inválidos");
        err.setPath(request.getRequestURI());

        for (FieldError f : e.getBindingResult().getFieldErrors()) {
            err.addError(f.getField(), f.getDefaultMessage());
        }

        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ValidationError> handleHttpMessageNotReadable(HttpMessageNotReadableException e, HttpServletRequest request) {
        HttpStatus status = HttpStatus.UNPROCESSABLE_ENTITY;
        ValidationError err = new ValidationError();
        err.setTimestamp(Instant.now());
        err.setStatus(status.value());
        err.setError("Validation exception");
        err.setMessage("Erro de leitura do corpo da requisição");
        err.setPath(request.getRequestURI());

        if (e.getCause() instanceof InvalidFormatException invalidFormat) {
            String fieldName = invalidFormat.getPath().stream()
                    .map(p -> p.getFieldName())
                    .findFirst().orElse("campo desconhecido");

            String mensagem = "Valor '" + invalidFormat.getValue() + "' é inválido para o campo '" + fieldName + "'";
            err.addError(fieldName, mensagem);
        }
        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandardError> genericException(Exception e, HttpServletRequest request) {
        String error = "Internal server error";
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR; // Erro 500

        // IMPORTANTE: Logar o erro real para a equipe de desenvolvimento poder investigar.
        // Em um projeto real, você usaria um sistema de logs como SLF4J.
        System.err.println("ERRO INESPERADO CAPTURADO: " + e.getMessage());
        e.printStackTrace();

        StandardError err = new StandardError();
        err.setTimestamp(Instant.now());
        err.setStatus(status.value());
        err.setError(error);
        // Mensagem genérica e segura para o usuário final.
        err.setMessage("Ocorreu um erro inesperado no sistema. Tente novamente mais tarde.");
        err.setPath(request.getRequestURI());

        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<StandardError> badCredentials(BadCredentialsException e, HttpServletRequest request) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        StandardError err = new StandardError();
        err.setTimestamp(Instant.now());
        err.setStatus(status.value());
        err.setError("Unauthorized");
        err.setMessage("Usuário inexistente ou senha inválida");
        err.setPath(request.getRequestURI());
        return ResponseEntity.status(status).body(err);
    }


    private ResponseEntity<StandardError> buildErrorResponse(
            Exception e, String error, HttpStatus status, HttpServletRequest request) {

        StandardError err = new StandardError();
        err.setTimestamp(Instant.now());
        err.setStatus(status.value());
        err.setError(error);
        err.setMessage(e.getMessage());
        err.setPath(request.getRequestURI());
        return ResponseEntity.status(status).body(err);
    }
}
