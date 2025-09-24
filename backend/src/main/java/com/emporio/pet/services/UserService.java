package com.emporio.pet.services;

import com.emporio.pet.dto.CustomerDTO;
import com.emporio.pet.dto.EmployeeDTO;
import com.emporio.pet.dto.UserDTO;
import com.emporio.pet.dto.UserUpdateDTO;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.Employee;
import com.emporio.pet.entities.User;
import com.emporio.pet.entities.enums.UserStatus;
import com.emporio.pet.repositories.CustomerRepository;
import com.emporio.pet.repositories.EmployeeRepository;
import com.emporio.pet.repositories.UserRepository;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;

    public UserService(UserRepository userRepository, CustomerRepository customerRepository, EmployeeRepository employeeRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.authService = authService;
        this.customerRepository = customerRepository;
    }

    /**
     * Retorna todos os usuários de acordo com os filtros (nome, CPF, status e role).
     */
    @Transactional(readOnly = true)
    public Page<UserDTO> findAll(Pageable pageable, String searchTerm, UserStatus status, String role) {
        String roleAuthority = "ROLE_" + role.toUpperCase();
        Page<User> userPage;

        String cleanNumericTerm = (searchTerm != null) ? searchTerm.replaceAll("[^0-9]", "") : "";

        if (searchTerm != null && !cleanNumericTerm.isEmpty()) {
            userPage = userRepository.findByCpfAndRole(cleanNumericTerm, status, roleAuthority, pageable);
        } else {
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

    /**
     * Busca um usuário pelo ID, retornando a DTO correspondente ao seu tipo.
     */
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

    /**
     * Retorna os dados do usuário autenticado (Customer, Employee ou User).
     */
    @Transactional(readOnly = true)
    public UserDTO getMe() {
        User user = authService.authenticated();

        if (user instanceof Customer) {
            Customer customerWithPets = customerRepository.findByIdWithPets(user.getId()).orElse((Customer) user);
            return new CustomerDTO(customerWithPets);
        }
        if (user instanceof Employee) {
            Employee employeeWithServices = employeeRepository.findByIdWithServices(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            return new EmployeeDTO(employeeWithServices);
        }
        return new UserDTO(user);
    }


    /**
     * Atualiza os dados do usuário autenticado.
     */
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

    /**
     * Atualiza o status de um usuário pelo ID.
     */
    @Transactional
    public UserDTO updateStatus(Long userId, UserStatus newStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com o ID: " + userId));

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
