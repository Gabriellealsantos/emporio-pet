package com.emporio.pet.controllers;

import com.emporio.pet.dto.UserDTO;
import com.emporio.pet.dto.UserStatusUpdateDTO;
import com.emporio.pet.entities.enums.UserStatus;
import com.emporio.pet.services.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        UserDTO dto = userService.getMe();
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDTO>> findAll(
            Pageable pageable,
            @RequestParam(value = "searchTerm", required = false) String searchTerm,
            @RequestParam(value = "status", required = false) UserStatus status,
            @RequestParam(value = "role", required = false) String role) {

        Page<UserDTO> page = userService.findAll(pageable, searchTerm, status, role);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> findById(@PathVariable Long id) {
        UserDTO dto = userService.findById(id);
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserDTO> updateStatus(@PathVariable Long id, @RequestBody UserStatusUpdateDTO dto) {
        UserDTO updatedUser = userService.updateStatus(id, dto.getNewStatus());
        return ResponseEntity.ok(updatedUser);
    }

}
