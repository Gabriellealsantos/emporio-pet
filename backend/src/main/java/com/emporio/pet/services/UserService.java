package com.emporio.pet.services;

import com.emporio.pet.dto.CustomerDTO;
import com.emporio.pet.dto.EmployeeDTO;
import com.emporio.pet.dto.UserDTO;
import com.emporio.pet.dto.UserUpdateDTO;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.Employee;
import com.emporio.pet.entities.Role;
import com.emporio.pet.entities.User;
import com.emporio.pet.entities.enums.UserStatus;
import com.emporio.pet.repositories.EmployeeRepository;
import com.emporio.pet.repositories.UserRepository;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;

    public UserService(UserRepository userRepository, EmployeeRepository employeeRepository,AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.employeeRepository = employeeRepository;
    }


    @Transactional(readOnly = true)
    public Page<UserDTO> findAll(Pageable pageable, String searchTerm, UserStatus status, String role) {

        String roleAuthority = "ROLE_" + role.toUpperCase();
        Page<User> userPage;

        // Se o termo de busca não for fornecido, buscamos todos os usuários com aquele role/status
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return Page.empty(pageable);
        }

        // Remove todos os caracteres não numéricos
        String cleanNumericTerm = searchTerm.replaceAll("[^0-9]", "");

        // DECISÃO: Se o termo limpo tiver 1 ou mais dígitos, asumimos que é uma busca por CPF.
        if (cleanNumericTerm.length() > 0) {
            userPage = userRepository.findByCpfAndRole(cleanNumericTerm, status, roleAuthority, pageable);
        } else {
            userPage = userRepository.findByNameAndRole(searchTerm, status, roleAuthority, pageable);
        }

        // Mapeamento para DTOs continua o mesmo
        return userPage.map(user -> {
            if (user instanceof Customer) {
                return new CustomerDTO((Customer) user);
            } else if (user instanceof Employee) {
                return new EmployeeDTO((Employee) user);
            } else {
                return new UserDTO(user);
            }
        });
    }
    @Transactional
    public UserDTO findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user instanceof Customer) {
            return new CustomerDTO((Customer) user);
        }
        if (user instanceof Employee) {
            Employee employeeWithServices = employeeRepository.findByIdWithServices(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            return new EmployeeDTO(employeeWithServices);
        }
        return new UserDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getMe() {
        User user = authService.authenticated();

        if (user instanceof Customer) {
            return new CustomerDTO((Customer) user);
        }
        if (user instanceof Employee) {
            return new EmployeeDTO((Employee) user);
        }
        return new UserDTO(user);
    }

    @Transactional
    public UserDTO updateMe(UserUpdateDTO dto) {
        User user = authService.authenticated();

        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getBirthDate() != null) user.setBirthDate(dto.getBirthDate());

        user = userRepository.save(user);

        if (user instanceof Customer) {
            return new CustomerDTO((Customer) user);
        } else if (user instanceof Employee) {
            return new EmployeeDTO((Employee) user);
        }
        return new UserDTO(user);
    }

    @Transactional
    public UserDTO updateStatus(Long userId, UserStatus newStatus) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new ResourceNotFoundException("Usuário não encontrado com o ID: " + userId)
        );
        user.setUserStatus(newStatus);
        user = userRepository.save(user);

        if (user instanceof Customer) {
            return new CustomerDTO((Customer) user);
        } else if (user instanceof Employee) {
            return new EmployeeDTO((Employee) user);
        } else {
            return new UserDTO(user);
        }
    }
}