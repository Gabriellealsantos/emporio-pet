package com.emporio.pet.services;

import com.emporio.pet.dto.AppointmentDTO;
import com.emporio.pet.dto.AppointmentInsertDTO;
import com.emporio.pet.entities.*;
import com.emporio.pet.entities.enums.AppointmentStatus;
import com.emporio.pet.repositories.*;
import com.emporio.pet.services.exceptions.ConflictException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    // --- CONSTANTES PARA CONFIGURAÇÃO ---
    private static final int SLOT_INTERVAL_MINUTES = 30;
    private static final int PREPARATION_BUFFER_MINUTES = 15;
    private static final int START_HOUR = 8;
    private static final int END_HOUR = 18;
    private static final int LUNCH_START_HOUR = 12;
    private static final int LUNCH_END_HOUR = 13;

    private final AppointmentRepository appointmentRepository;
    private final ServiceRepository serviceRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;
    private final PetRepository petRepository;
    private final CustomerRepository customerRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, ServiceRepository serviceRepository,
                              EmployeeRepository employeeRepository, AuthService authService, PetRepository petRepository ,
                              CustomerRepository customerRepository) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
        this.employeeRepository = employeeRepository;
        this.authService = authService;
        this.petRepository = petRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public List<LocalDateTime> findAvailableTimes(Long serviceId, LocalDate date, Long employeeId) {  {

        // 1. Buscar Informações Iniciais
        Services service = serviceRepository.findByIdWithQualifiedEmployees(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
        long totalDuration = service.getEstimatedDurationInMinutes() + PREPARATION_BUFFER_MINUTES;

        // 2. Definir Horário de Trabalho
        LocalDateTime startOfDay = date.atTime(START_HOUR, 0);
        LocalDateTime endOfDay = date.atTime(END_HOUR, 0);
        LocalDateTime lunchStart = date.atTime(LUNCH_START_HOUR, 0);
        LocalDateTime lunchEnd = date.atTime(LUNCH_END_HOUR, 0);

        // 3. Filtrar Funcionários Relevantes
        List<Employee> qualifiedEmployees;
        if (employeeId != null) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));
            if (!employee.getSkilledServices().contains(service)) {
                return new ArrayList<>(); // Retorna vazio se o funcionário não for qualificado
            }
            qualifiedEmployees = List.of(employee);
        } else {
            qualifiedEmployees = new ArrayList<>(service.getQualifiedEmployees());
        }

        if (qualifiedEmployees.isEmpty()) {
            return new ArrayList<>(); // Nenhum funcionário qualificado para este serviço
        }

        // 4. Buscar Agendamentos Existentes
        List<AppointmentStatus> statusesToExclude = List.of(AppointmentStatus.CANCELED, AppointmentStatus.NO_SHOW);
        List<Appointment> existingAppointments = appointmentRepository.findAppointmentsForEmployeesInInterval(
                qualifiedEmployees, startOfDay, endOfDay, statusesToExclude);

        // 5. Gerar e Validar Slots de Horário
        List<LocalDateTime> availableSlots = new ArrayList<>();
        LocalDateTime currentTime = startOfDay;

        while (currentTime.plusMinutes(totalDuration).isBefore(endOfDay) || currentTime.plusMinutes(totalDuration).isEqual(endOfDay)) {
            LocalDateTime potentialStart = currentTime;
            LocalDateTime potentialEnd = currentTime.plusMinutes(totalDuration);

            // Se o slot colidir com o almoço, avançamos o tempo para o fim do almoço
            if (potentialStart.isBefore(lunchEnd) && potentialEnd.isAfter(lunchStart)) {
                currentTime = lunchEnd;
                continue;
            }

            // Verifica se existe pelo menos um funcionário livre neste slot
            boolean isSlotAvailable = qualifiedEmployees.stream().anyMatch(employee -> {
                // Filtra os agendamentos apenas para este funcionário
                List<Appointment> employeeAppointments = existingAppointments.stream()
                        .filter(app -> app.getEmployee().getId().equals(employee.getId()))
                        .toList();

                // Verifica se o slot colide com algum agendamento do funcionário
                return employeeAppointments.stream().noneMatch(existingApp ->
                        potentialStart.isBefore(existingApp.getEndDateTime()) && potentialEnd.isAfter(existingApp.getStartDateTime())
                );
            });

            if (isSlotAvailable) {
                availableSlots.add(potentialStart);
            }

            currentTime = currentTime.plusMinutes(SLOT_INTERVAL_MINUTES);
        }

        return availableSlots;
    }}


    @Transactional
    public AppointmentDTO create(AppointmentInsertDTO dto) {
        // 1. Validação de Segurança e Entidades
        User user = authService.authenticated();
        if (!(user instanceof Customer owner)) {
            throw new ForbiddenException("Acesso negado. Apenas clientes podem criar agendamentos.");
        }

        Services service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet não encontrado"));

        // Garante que o pet pertence ao cliente logado
        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new ForbiddenException("Acesso negado. Você só pode agendar para seus próprios pets.");
        }

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));

        // 2. Revalidação Crítica de Disponibilidade
        // (Previne race conditions e requisições maliciosas)
        List<LocalDateTime> availableTimes = findAvailableTimes(dto.getServiceId(), dto.getStartDateTime().toLocalDate(), dto.getEmployeeId());
        if (!availableTimes.contains(dto.getStartDateTime())) {
            throw new ConflictException("O horário selecionado não está mais disponível.");
        }

        // 3. Criar e Salvar a Entidade
        Appointment entity = new Appointment();
        entity.setService(service);
        entity.setPet(pet);
        entity.setEmployee(employee);
        entity.setStartDateTime(dto.getStartDateTime());

        long duration = service.getEstimatedDurationInMinutes(); // Não inclui o buffer aqui
        entity.setEndDateTime(dto.getStartDateTime().plusMinutes(duration));

        entity.setStatus(AppointmentStatus.SCHEDULED); // Status inicial

        entity = appointmentRepository.save(entity);

        return new AppointmentDTO(entity);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> findMyAppointments() {
        User user = authService.authenticated();

        // 2. Verifica se é um cliente
        if (!(user instanceof Customer customer)) {
            // Se não for um cliente (ex: admin, funcionário), retorna uma lista vazia
            // pois este endpoint é específico para "meus" agendamentos como cliente.
            return Collections.emptyList();
        }

        Customer customerWithPets = customerRepository.findByIdWithPets(customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));

        // 3. Busca os pets do cliente
        // Não precisamos buscar no banco, pois a entidade Customer já tem a lista de pets.
        // Se a lista estiver vazia, não há o que buscar.
        if (customerWithPets.getPets().isEmpty()) {
            return Collections.emptyList();
        }

        // 4. Usa o novo método do repositório para buscar os agendamentos
        List<Appointment> appointments = appointmentRepository.findByPetInOrderByStartDateTimeDesc(customerWithPets.getPets());

        // 5. Converte a lista de entidades para uma lista de DTOs e retorna
        return appointments.stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> findAppointmentsByDate(LocalDate min, LocalDate max, Long employeeId) {
        // Converte as datas para LocalDateTime para abranger o dia inteiro
        LocalDateTime minDate = min.atStartOfDay(); // Ex: 2025-09-10T00:00:00
        LocalDateTime maxDate = max.atTime(23, 59, 59); // Ex: 2025-09-10T23:59:59

        List<Appointment> appointments = appointmentRepository.findAppointmentsByFilter(minDate, maxDate, employeeId);

        return appointments.stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDTO updateStatus(Long id, AppointmentStatus newStatus) {
        // 1. Busca o agendamento ou lança exceção se não existir
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado com o ID: " + id));

        // 2. Altera o status
        appointment.setStatus(newStatus);

        // 3. Salva a alteração no banco
        appointment = appointmentRepository.save(appointment);

        // 4. Retorna o DTO atualizado
        return new AppointmentDTO(appointment);
    }

    @Transactional
    public void cancel(Long id) {
        // 1. Pega o usuário e verifica se é um cliente
        User user = authService.authenticated();
        if (!(user instanceof Customer customer)) {
            throw new ForbiddenException("Acesso negado. Apenas clientes podem cancelar agendamentos.");
        }

        // 2. Busca o agendamento
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado com o ID: " + id));

        // 3. Validação de Segurança: O agendamento pertence a este cliente?
        if (!appointment.getPet().getOwner().getId().equals(customer.getId())) {
            throw new ForbiddenException("Acesso negado. Você só pode cancelar seus próprios agendamentos.");
        }

        // 4. Validação de Regra de Negócio: Antecedência de 24 horas
        if (LocalDateTime.now().plusHours(24).isAfter(appointment.getStartDateTime())) {
            throw new ConflictException("Cancelamento não permitido. O agendamento deve ser cancelado com mais de 24 horas de antecedência.");
        }

        // 5. Validação de Status: Não cancelar o que já foi concluído
        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELED) {
            throw new ConflictException("Este agendamento não pode mais ser cancelado.");
        }

        // 6. Altera o status e salva
        appointment.setStatus(AppointmentStatus.CANCELED);
        appointmentRepository.save(appointment);
    }
}