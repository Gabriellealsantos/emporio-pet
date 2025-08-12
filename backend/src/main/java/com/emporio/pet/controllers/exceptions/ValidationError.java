package com.emporio.pet.controllers.exceptions;

import com.emporio.pet.config.handlers.StandardError;

import java.util.ArrayList;
import java.util.List;

public class ValidationError extends StandardError {

    private List<FieldMessage> errors = new ArrayList<>();

    public List<FieldMessage> getErrors() {
        return errors;
    }

    public void addError(String fieldName,String message) {
        errors.add(new FieldMessage(fieldName, message));
    }
}
