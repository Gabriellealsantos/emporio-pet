package com.emporio.pet.services;

import com.emporio.pet.dto.ServicesDTO;
import com.emporio.pet.dto.ServicesInsertDTO;
import com.emporio.pet.dto.ServicesUpdateDTO;
import com.emporio.pet.entities.Services;
import com.emporio.pet.repositories.ServiceRepository;
import com.emporio.pet.services.exceptions.ConflictException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServicesService {

    private final ServiceRepository serviceRepository;
    private final AuthService authService;

    public ServicesService(ServiceRepository serviceRepository, AuthService authService) {
        this.serviceRepository = serviceRepository;
        this.authService = authService;
    }

    /**
     * Cria um novo serviço prestado pelo petshop.
     * Apenas administradores podem realizar esta operação.
     */
    @Transactional
    public ServicesDTO createService(ServicesInsertDTO dto) {
        Optional<Services> existingService = serviceRepository.findByNameIgnoreCase(dto.getName());
        if (existingService.isPresent()) {
            throw new ConflictException("Já existe um serviço com este nome.");
        }
        Services service = new Services();
        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setPrice(dto.getPrice());
        service.setEstimatedDurationInMinutes(dto.getEstimatedDurationInMinutes());
        service.setActive(true);

        service = serviceRepository.save(service);
        return new ServicesDTO(service);
    }

    @Transactional(readOnly = true)
    public List<ServicesDTO> findAll(String name, Boolean active) {
        List<Services> services = serviceRepository.findAllFiltered(name, active);
        return services.stream().map(ServicesDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServicesDTO> findAllActiveServices() {
        return findAll(null, true);
    }

    /**
     * Busca um serviço pelo ID.
     * Apenas serviços ativos podem ser acessados.
     */
    @Transactional(readOnly = true)
    public ServicesDTO findById(Long id) {
        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com o ID: " + id));
        return new ServicesDTO(service);
    }

    /**
     * Atualiza os dados de um serviço.
     * Apenas administradores podem realizar esta operação.
     */
    @Transactional
    public ServicesDTO update(Long id, ServicesUpdateDTO dto) {
        if (!authService.isSelfOrAdmin(authService.authenticated().getId())) {
            throw new ForbiddenException("Acesso negado. Apenas administradores podem atualizar serviços.");
        }

        if (dto.getName() != null) {
            Optional<Services> existingService = serviceRepository.findByNameIgnoreCase(dto.getName());
            if (existingService.isPresent() && !existingService.get().getId().equals(id)) {
                throw new ConflictException("Já existe outro serviço com este nome.");
            }
            dto.setName(dto.getName());
        }

        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com o ID: " + id));

        if (dto.getName() != null) {
            service.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            service.setDescription(dto.getDescription());
        }
        if (dto.getPrice() != null) {
            service.setPrice(dto.getPrice());
        }

        service = serviceRepository.save(service);
        return new ServicesDTO(service);
    }

    /**
     * Desativa um serviço (Soft Delete).
     * Apenas administradores podem realizar esta operação.
     */
    @Transactional
    public void deactivate(Long id) {
        if (!authService.isSelfOrAdmin(authService.authenticated().getId())) {
            throw new ForbiddenException("Acesso negado. Apenas administradores podem desativar serviços.");
        }

        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com o ID: " + id));

        service.setActive(false);
        serviceRepository.save(service);
    }

    /**
     * Ativa um serviço previamente desativado.
     * Apenas administradores podem realizar esta operação.
     */
    @Transactional
    public void activate(Long id) {
        if (!authService.isSelfOrAdmin(authService.authenticated().getId())) {
            throw new ForbiddenException("Acesso negado. Apenas administradores podem ativar serviços.");
        }

        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com o ID: " + id));

        if (service.isActive()) {
            throw new IllegalStateException("O serviço já está ativo.");
        }

        service.setActive(true);
        serviceRepository.save(service);
    }
}