package com.emporio.pet.services;

import com.emporio.pet.dto.EmployeeDTO;
import com.emporio.pet.dto.EmployeeInsertDTO;
import com.emporio.pet.dto.EmployeeUpdateDTO;
import com.emporio.pet.entities.Employee;
import com.emporio.pet.entities.Role;
import com.emporio.pet.entities.Services;
import com.emporio.pet.entities.enums.UserStatus;
import com.emporio.pet.repositories.EmployeeRepository;
import com.emporio.pet.repositories.RoleRepository;
import com.emporio.pet.repositories.ServiceRepository;
import com.emporio.pet.repositories.UserRepository;
import com.emporio.pet.services.exceptions.DatabaseException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final ServiceRepository serviceRepository;

    public EmployeeService(EmployeeRepository employeeRepository, UserRepository userRepository,
                           AuthService authService, PasswordEncoder passwordEncoder,
                           RoleRepository roleRepository, ServiceRepository serviceRepository) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.serviceRepository = serviceRepository;
    }


    /**
     * Cria um novo funcionário: valida duplicidade de email, configura papel e salva.
     */
    @Transactional
    public EmployeeDTO create(EmployeeInsertDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DatabaseException("O email informado já está em uso.");
        }

        Employee employee = new Employee();

        employee.setName(dto.getName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setBirthDate(dto.getBirthDate());
        employee.setPassword(passwordEncoder.encode(dto.getPassword()));
        employee.setUserStatus(UserStatus.NON_BLOCKED);
        employee.setJobTitle(dto.getJobTitle());

        Role employeeRole = roleRepository.findByAuthority("ROLE_EMPLOYEE");
        employee.getRoles().add(employeeRole);

        Employee savedEmployee = employeeRepository.save(employee);
        return new EmployeeDTO(savedEmployee);
    }

    /**
     * Atualiza dados de um funcionário existente. Verifica permissão (self ou admin) antes de atualizar.
     */
    @Transactional
    public EmployeeDTO update(Long id, EmployeeUpdateDTO dto) {
        if (!authService.isSelfOrAdmin(id)) {
            throw new ForbiddenException("Acesso negado");
        }

        Employee employeeEntity = employeeRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Funcionário não encontrado")
        );

        // Atualização direta dos campos
        if (dto.getName() != null) employeeEntity.setName(dto.getName());
        if (dto.getPhone() != null) employeeEntity.setPhone(dto.getPhone());
        if (dto.getJobTitle() != null) employeeEntity.setJobTitle(dto.getJobTitle());

        employeeEntity = employeeRepository.save(employeeEntity);
        return new EmployeeDTO(employeeEntity);
    }


    /**
     * Adiciona um serviço à lista de habilidades do funcionário e retorna o DTO atualizado.
     */
    @Transactional
    public EmployeeDTO addServiceToEmployee(Long employeeId, Long serviceId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado com o ID: " + employeeId));

        Services service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com o ID: " + serviceId));

        employee.getSkilledServices().add(service);
        employee = employeeRepository.save(employee);
        return new EmployeeDTO(employee);
    }

    /**
     * Remove a associação de um serviço do funcionário. Lança ResourceNotFoundException se não existir.
     */
    @Transactional
    public void removeServiceFromEmployee(Long employeeId, Long serviceId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado com o ID: " + employeeId));

        Services serviceToRemove = employee.getSkilledServices().stream()
                .filter(service -> service.getId().equals(serviceId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não possui associação com o serviço de ID: " + serviceId));

        employee.getSkilledServices().remove(serviceToRemove);
        employeeRepository.save(employee);
    }
}
