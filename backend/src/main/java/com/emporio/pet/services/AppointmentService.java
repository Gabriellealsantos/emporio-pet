package com.emporio.pet.services;

import com.emporio.pet.dto.AppointmentDTO;
import com.emporio.pet.dto.AppointmentInsertDTO;
import com.emporio.pet.entities.*;
import com.emporio.pet.entities.enums.AppointmentStatus;
import com.emporio.pet.repositories.*;
import com.emporio.pet.services.exceptions.ConflictException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    // --- CONSTANTES PARA CONFIGURAÇÃO ---
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
                              EmployeeRepository employeeRepository, AuthService authService, PetRepository petRepository,
                              CustomerRepository customerRepository) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
        this.employeeRepository = employeeRepository;
        this.authService = authService;
        this.petRepository = petRepository;
        this.customerRepository = customerRepository;
    }


    /**
     * Retorna lista de agendamentos faturáveis de um cliente. Valida existência do cliente.
     */
    @Transactional(readOnly = true)
    public List<AppointmentDTO> findFaturableByCustomer(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Cliente não encontrado com o ID: " + customerId);
        }

        List<Appointment> appointments = appointmentRepository.findFaturableAppointmentsByCustomer(customerId);

        return appointments.stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Retorna página de agendamentos do cliente autenticado, filtrando por data e status.
     */
    @Transactional(readOnly = true)
    public Page<AppointmentDTO> findMyAppointments(Pageable pageable, LocalDate minDate, LocalDate maxDate, AppointmentStatus status) {
        User user = authService.authenticated();

        if (!(user instanceof Customer customer)) {
            return Page.empty();
        }

        Customer customerWithPets = customerRepository.findByIdWithPets(customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));

        if (customerWithPets.getPets().isEmpty()) {
            return Page.empty();
        }

        LocalDateTime start = (minDate != null) ? minDate.atStartOfDay() : null;
        LocalDateTime end = (maxDate != null) ? maxDate.atTime(23, 59, 59) : null;

        Page<Appointment> appointments = appointmentRepository.findAppointmentsByPetsAndDateRange(customerWithPets.getPets(), start, end, status, pageable);

        return appointments.map(AppointmentDTO::new);
    }

    /**
     * Calcula e retorna horários disponíveis para um serviço em uma data específica,
     * opcionalmente filtrando por funcionário.
     */
    @Transactional(readOnly = true)
    public List<LocalDateTime> findAvailableTimes(Long serviceId, LocalDate date, Long employeeId) {
        // 1. Busca de Dados Essenciais
        Services service = serviceRepository.findByIdWithQualifiedEmployees(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
        long serviceDuration = service.getEstimatedDurationInMinutes();

        // 2. Define o Horário de Trabalho do Dia
        LocalDateTime startOfWork = date.atTime(START_HOUR, 0);
        LocalDateTime endOfWork = date.atTime(END_HOUR, 0);
        LocalDateTime lunchStart = date.atTime(LUNCH_START_HOUR, 0);
        LocalDateTime lunchEnd = date.atTime(LUNCH_END_HOUR, 0);

        // 3. Filtra os Funcionários Relevantes
        List<Employee> qualifiedEmployees;
        if (employeeId != null) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));
            if (!employee.isAccountNonLocked()) {
                return new ArrayList<>();
            }
            if (!employee.getSkilledServices().contains(service)) return new ArrayList<>();
            qualifiedEmployees = List.of(employee);
        } else {
            qualifiedEmployees = service.getQualifiedEmployees().stream()
                    .filter(User::isAccountNonLocked)
                    .collect(Collectors.toList());
        }
        if (qualifiedEmployees.isEmpty()) return new ArrayList<>();

        // 4. Busca TODOS os agendamentos do dia para os funcionários qualificados
        List<AppointmentStatus> statusesToExclude = List.of(AppointmentStatus.CANCELED, AppointmentStatus.NO_SHOW);
        List<Appointment> existingAppointments = appointmentRepository.findAppointmentsForEmployeesInInterval(
                qualifiedEmployees, date.atStartOfDay(), date.atTime(23, 59), statusesToExclude);

        // 5. O NOVO ALGORITMO: Para cada funcionário, calcula os horários livres
        return qualifiedEmployees.stream()
                // Para cada funcionário, gera uma lista de seus horários disponíveis
                .flatMap(employee -> {
                    List<Appointment> employeeAppointments = existingAppointments.stream()
                            .filter(app -> app.getEmployee().getId().equals(employee.getId()))
                            .sorted(Comparator.comparing(Appointment::getStartDateTime))
                            .collect(Collectors.toList());

                    List<LocalDateTime> availableSlotsForEmployee = new ArrayList<>();
                    LocalDateTime nextAvailableTime = startOfWork;

                    // Itera sobre os agendamentos existentes do funcionário
                    for (Appointment existingApp : employeeAppointments) {
                        findGaps(nextAvailableTime, existingApp.getStartDateTime(), serviceDuration, lunchStart, lunchEnd, availableSlotsForEmployee);
                        // O próximo horário livre é o fim do agendamento atual + o tempo de preparação
                        nextAvailableTime = existingApp.getEndDateTime().plusMinutes(PREPARATION_BUFFER_MINUTES);
                    }

                    // Verifica o último espaço, entre o último agendamento e o fim do dia
                    findGaps(nextAvailableTime, endOfWork, serviceDuration, lunchStart, lunchEnd, availableSlotsForEmployee);

                    return availableSlotsForEmployee.stream();
                })
                .distinct() // Remove horários duplicados (caso mais de um funcionário esteja livre)
                .sorted()   // Ordena a lista final
                .collect(Collectors.toList());
    }

    /**
     * Retorna página de agendamentos filtrados por data, funcionário e status.
     */
    @Transactional(readOnly = true)
    public Page<AppointmentDTO> findAppointmentsByDate(LocalDate min, LocalDate max, Long employeeId, AppointmentStatus status, Pageable pageable) {
        LocalDateTime minDate = (min != null) ? min.atStartOfDay() : null;
        LocalDateTime maxDate = (max != null) ? max.atTime(23, 59, 59) : null;

        Page<Appointment> appointmentsPage = appointmentRepository.findAppointmentsByFilter(minDate, maxDate, employeeId, status, pageable);

        return appointmentsPage.map(AppointmentDTO::new);
    }

    /**
     * Retorna a lista de próximos agendamentos do cliente autenticado.
     */
    @Transactional(readOnly = true)
    public List<AppointmentDTO> findUpcomingByCustomer() {
        User user = authService.authenticated();
        if (!(user instanceof Customer customer)) {
            return Collections.emptyList();
        }
        Customer customerWithPets = customerRepository.findByIdWithPets(customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));

        if (customerWithPets.getPets().isEmpty()) {
            return Collections.emptyList();
        }
        
        List<AppointmentStatus> validStatuses = List.of(
                AppointmentStatus.SCHEDULED,
                AppointmentStatus.IN_PROGRESS
        );

        List<Appointment> appointments = appointmentRepository
                .findByPetInAndStartDateTimeAfterAndStatusInOrderByStartDateTimeAsc(
                        customerWithPets.getPets(),
                        LocalDateTime.now(),
                        validStatuses
                );

        return appointments.stream().map(AppointmentDTO::new).collect(Collectors.toList());
    }


    /**
     * Cria um novo agendamento para o cliente autenticado: validações, designação de funcionário e persistência.
     */
    @Transactional
    public AppointmentDTO create(AppointmentInsertDTO dto) {
        // 1. Validações Iniciais (Cliente, Pet, Serviço)
        User user = authService.authenticated();
        if (!(user instanceof Customer owner)) {
            throw new ForbiddenException("Acesso negado. Apenas clientes podem criar agendamentos.");
        }
        Services service = serviceRepository.findByIdWithQualifiedEmployees(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
        if (!service.isActive()) {
            throw new ConflictException("Não é possível agendar um serviço que está inativo.");
        }
        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet não encontrado"));
        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new ForbiddenException("Acesso negado. Você só pode agendar para seus próprios pets.");
        }

        Employee designatedEmployee;
        LocalDateTime startTime = dto.getStartDateTime();

        // 2. Lógica de Designação de Funcionário
        if (dto.getEmployeeId() != null) {
            // CENÁRIO 1: O cliente ESCOLHEU um funcionário.
            Employee chosenEmployee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Funcionário escolhido não encontrado."));

            // Validação extra: O funcionário escolhido é qualificado e está realmente livre?
            boolean isQualified = service.getQualifiedEmployees().contains(chosenEmployee);
            List<LocalDateTime> availableTimesForEmployee = findAvailableTimes(service.getId(), startTime.toLocalDate(), chosenEmployee.getId());

            if (!isQualified || !availableTimesForEmployee.contains(startTime)) {
                throw new ConflictException("O funcionário escolhido não está disponível neste horário para este serviço.");
            }
            designatedEmployee = chosenEmployee;

        } else {
            // CENÁRIO 2: O cliente NÃO escolheu. O sistema encontra um.
            // (Esta é a lógica que já tínhamos implementado)
            designatedEmployee = findAvailableEmployeeForSlot(service, startTime);
        }
        if (!designatedEmployee.isAccountNonLocked()) {
            throw new ConflictException("O profissional selecionado não está mais disponível.");
        }

        // 3. Criar e Salvar o Agendamento
        Appointment entity = new Appointment();
        entity.setService(service);
        entity.setPet(pet);
        entity.setEmployee(designatedEmployee);
        entity.setStartDateTime(startTime);
        long duration = service.getEstimatedDurationInMinutes();
        entity.setEndDateTime(startTime.plusMinutes(duration));
        entity.setChargedAmount(service.getPrice());
        entity.setStatus(AppointmentStatus.SCHEDULED);

        entity = appointmentRepository.save(entity);
        return new AppointmentDTO(entity);
    }

    /**
     * Atualiza o status de um agendamento existente e retorna o DTO atualizado.
     */
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

    /**
     * Cancela um agendamento: regras diferentes para ADMIN e para o cliente proprietário.
     */
    @Transactional
    public void cancel(Long id) {
        User user = authService.authenticated();
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado com o ID: " + id));

        if (user.hasRole("ROLE_ADMIN")) {
            if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                throw new ConflictException("Agendamentos concluídos não podem ser cancelados.");
            }
            appointment.setStatus(AppointmentStatus.CANCELED);
            appointmentRepository.save(appointment);
            return;
        }

        if (user instanceof Customer customer) {
            if (!appointment.getPet().getOwner().getId().equals(customer.getId())) {
                throw new ForbiddenException("Acesso negado. Você só pode cancelar seus próprios agendamentos.");
            }
            if (LocalDateTime.now().plusHours(12).isAfter(appointment.getStartDateTime())) {
                throw new ConflictException("Cancelamento não permitido. O agendamento deve ser cancelado com mais de 12 horas de antecedência.");
            }
            if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELED) {
                throw new ConflictException("Este agendamento não pode mais ser cancelado.");
            }
            appointment.setStatus(AppointmentStatus.CANCELED);
            appointmentRepository.save(appointment);
            return;
        }

        // 3. Se não for nem Admin, nem o Cliente dono do agendamento, o acesso é negado.
        throw new ForbiddenException("Acesso negado.");
    }

    /**
     * Encontra um funcionário qualificado disponível para o período especificado ou lança conflito.
     */
    private Employee findAvailableEmployeeForSlot(Services service, LocalDateTime potentialStart) {
        long duration = service.getEstimatedDurationInMinutes();
        LocalDateTime potentialEnd = potentialStart.plusMinutes(duration);
        List<Employee> qualifiedEmployees = new ArrayList<>(service.getQualifiedEmployees());
        if (qualifiedEmployees.isEmpty()) {
            throw new ConflictException("Não há funcionários qualificados para este serviço.");
        }
        List<AppointmentStatus> statusesToExclude = List.of(AppointmentStatus.CANCELED, AppointmentStatus.NO_SHOW);
        List<Appointment> existingAppointments = appointmentRepository.findAppointmentsForEmployeesInInterval(
                qualifiedEmployees, potentialStart.toLocalDate().atStartOfDay(), potentialStart.toLocalDate().atTime(23, 59), statusesToExclude);

        return qualifiedEmployees.stream()
                .filter(employee -> existingAppointments.stream()
                        .filter(app -> app.getEmployee().getId().equals(employee.getId()))
                        .noneMatch(existingApp -> potentialStart.isBefore(existingApp.getEndDateTime()) && potentialEnd.isAfter(existingApp.getStartDateTime())))
                .findFirst()
                .orElseThrow(() -> new ConflictException("O horário selecionado não está mais disponível. Por favor, escolha outro."));
    }

    /**
     * Varre um intervalo procurando "gaps" onde um serviço com a duração fornecida encaixa,
     * respeitando o horário de almoço. Adiciona slots válidos em increments de 15 minutos.
     */
    private void findGaps(LocalDateTime startGap, LocalDateTime endGap, long serviceDuration,
                          LocalDateTime lunchStart, LocalDateTime lunchEnd, List<LocalDateTime> availableSlots) {
        LocalDateTime potentialSlot = startGap;
        while (!potentialSlot.plusMinutes(serviceDuration).isAfter(endGap)) {
            LocalDateTime endOfSlot = potentialSlot.plusMinutes(serviceDuration);
            // Verifica se o slot não colide com o almoço
            if (!(potentialSlot.isBefore(lunchEnd) && endOfSlot.isAfter(lunchStart))) {
                availableSlots.add(potentialSlot);
            }
            // Avança o ponteiro em incrementos de 15 minutos para testar o próximo slot
            potentialSlot = potentialSlot.plusMinutes(15);
        }
    }
}
