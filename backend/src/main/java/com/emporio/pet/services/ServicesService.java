package com.emporio.pet.services;

import com.emporio.pet.dto.EmployeeDTO;
import com.emporio.pet.dto.ServicesDTO;
import com.emporio.pet.dto.ServicesInsertDTO;
import com.emporio.pet.dto.ServicesUpdateDTO;
import com.emporio.pet.entities.Services;
import com.emporio.pet.entities.User;
import com.emporio.pet.repositories.ServiceRepository;
import com.emporio.pet.services.exceptions.ConflictException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServicesService {

    private final ServiceRepository serviceRepository;
    private final AuthService authService;
    private final FileStorageService fileStorageService;

    public ServicesService(ServiceRepository serviceRepository, AuthService authService, FileStorageService fileStorageService) {
        this.serviceRepository = serviceRepository;
        this.authService = authService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Retorna todos os serviços aplicando filtros opcionais de nome e status (ativo/inativo).
     */
    @Transactional(readOnly = true)
    public List<ServicesDTO> findAll(String name, Boolean active) {
        List<Services> services = serviceRepository.findAllFiltered(name, active);
        return services.stream().map(ServicesDTO::new).collect(Collectors.toList());
    }

    /**
     * Retorna apenas os serviços ativos.
     */
    @Transactional(readOnly = true)
    public List<ServicesDTO> findAllActiveServices() {
        return findAll(null, true);
    }

    /**
     * Busca um serviço pelo ID.
     */
    @Transactional(readOnly = true)
    public ServicesDTO findById(Long id) {
        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com o ID: " + id));
        return new ServicesDTO(service);
    }

    /**
     * Retorna os funcionários qualificados para executar determinado serviço.
     */
    @Transactional(readOnly = true)
    public List<EmployeeDTO> findQualifiedEmployees(Long serviceId) {
        Services service = serviceRepository.findByIdWithQualifiedEmployees(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com o ID: " + serviceId));

        return service.getQualifiedEmployees().stream()
                .filter(User::isAccountNonLocked)
                .map(EmployeeDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Busca todos os serviços marcados como destaque.
     */
    @Transactional(readOnly = true)
    public List<ServicesDTO> findAllFeatured() {
        List<Services> services = serviceRepository.findAllByIsFeaturedTrue();
        return services.stream().map(ServicesDTO::new).collect(Collectors.toList());
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
        service.setPriceDisplay(dto.getPriceDisplay());
        service.setDurationDisplay(dto.getDurationDisplay());
        service.setFeatured(dto.isFeatured());

        service = serviceRepository.save(service);
        return new ServicesDTO(service);
    }

    /**
     * Salva a imagem de um serviço.
     */
    @Transactional
    public void saveImage(Long id, MultipartFile file) {
        Services serviceEntity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com o ID: " + id));

        String imageUrl = fileStorageService.store(file);
        serviceEntity.setImageUrl(imageUrl);
        serviceRepository.save(serviceEntity);
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
        }

        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com o ID: " + id));

        if (dto.getName() != null) service.setName(dto.getName());
        if (dto.getDescription() != null) service.setDescription(dto.getDescription());
        if (dto.getPrice() != null) service.setPrice(dto.getPrice());
        if (dto.getPriceDisplay() != null) service.setPriceDisplay(dto.getPriceDisplay());
        if (dto.getDurationDisplay() != null) service.setDurationDisplay(dto.getDurationDisplay());
        if (dto.getFeatured() != null) service.setFeatured(dto.getFeatured());

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
