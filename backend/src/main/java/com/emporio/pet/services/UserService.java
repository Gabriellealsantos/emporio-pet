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

        // Limpa o termo de busca ANTES, verificando se é nulo.
        String cleanNumericTerm = (searchTerm != null) ? searchTerm.replaceAll("[^0-9]", "") : "";

        // Se o termo de busca parece ser um CPF...
        if (searchTerm != null && cleanNumericTerm.length() > 0) {
            userPage = userRepository.findByCpfAndRole(cleanNumericTerm, status, roleAuthority, pageable);
        }
        // Senão (se for uma busca por nome ou se a busca estiver vazia/nula)...
        else {
            // Passamos o searchTerm (que pode ser nulo ou uma string de nome) para a busca por nome.
            // A query `LIKE '%%'` no repositório vai lidar com a busca vazia/nula e retornar todos.
            userPage = userRepository.findByNameAndRole(searchTerm, status, roleAuthority, pageable);
        }

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