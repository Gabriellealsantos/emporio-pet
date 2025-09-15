package com.emporio.pet.services;

import com.emporio.pet.dto.InvoiceCreateDTO;
import com.emporio.pet.dto.InvoiceDTO;
import com.emporio.pet.entities.Appointment;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.Invoice;
import com.emporio.pet.entities.User;
import com.emporio.pet.entities.enums.AppointmentStatus;
import com.emporio.pet.entities.enums.InvoiceStatus;
import com.emporio.pet.repositories.AppointmentRepository;
import com.emporio.pet.repositories.CustomerRepository;
import com.emporio.pet.repositories.InvoiceRepository;
import com.emporio.pet.services.exceptions.ConflictException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final AuthService authService;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          AppointmentRepository appointmentRepository,
                          CustomerRepository customerRepository,
                          AuthService authService) {
        this.invoiceRepository = invoiceRepository;
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public InvoiceDTO findById(Long invoiceId) {
        if (!authService.canAccessInvoice(invoiceId)) {
            throw new ForbiddenException("Acesso negado.");
        }

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura não encontrada com o ID: " + invoiceId));

        return new InvoiceDTO(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceDTO> find(Pageable pageable, Long customerId, Instant minDate, Instant maxDate, InvoiceStatus status) {

        User authenticatedUser = authService.authenticated();
        if (authenticatedUser.hasRole("ROLE_CLIENT")) {
            customerId = authenticatedUser.getId();
        }

        Page<Invoice> page = invoiceRepository.findFiltered(pageable, customerId, minDate, maxDate, status);

        return page.map(InvoiceDTO::new);
    }

    @Transactional
    public InvoiceDTO markAsPaid(Long invoiceId) {
        // 1. Busca a fatura no banco de dados. Lança exceção se não encontrar.
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura não encontrada com o ID: " + invoiceId));

        // 2. Validação da regra de negócio: só se pode pagar uma fatura que está aguardando pagamento.
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new ConflictException("Esta fatura já foi paga.");
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELED) {
            throw new ConflictException("Não é possível pagar uma fatura cancelada.");
        }

        // 3. Altera o status para PAGO
        invoice.setStatus(InvoiceStatus.PAID);

        // 4. Salva a alteração no banco
        invoice = invoiceRepository.save(invoice);

        // 5. Retorna o DTO com os dados atualizados
        return new InvoiceDTO(invoice);
    }


    @Transactional
    public InvoiceDTO create(InvoiceCreateDTO dto) {
        // 1. Autorização: Verifica se o usuário logado é um funcionário ou admin
        User authenticatedUser = authService.authenticated();
        if (!authenticatedUser.hasRole("ROLE_EMPLOYEE") && !authenticatedUser.hasRole("ROLE_ADMIN")) {
            throw new ForbiddenException("Acesso negado. Apenas funcionários ou administradores podem criar faturas.");
        }

        // 2. Busca e Validação de Entidades
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o ID: " + dto.getCustomerId()));

        List<Appointment> appointmentsToInvoice = appointmentRepository.findAllById(dto.getAppointmentIds());

        if (appointmentsToInvoice.size() != dto.getAppointmentIds().size()) {
            throw new ResourceNotFoundException("Um ou mais agendamentos não foram encontrados.");
        }

        // 3. Validação das Regras de Negócio
        for (Appointment app : appointmentsToInvoice) {
            // Regra 1: Garante que todos os agendamentos pertencem ao cliente da fatura
            if (!app.getPet().getOwner().getId().equals(customer.getId())) {
                throw new ConflictException("O agendamento " + app.getId() + " não pertence ao cliente informado.");
            }
            // Regra 2: Garante que o agendamento está com status 'COMPLETED'
            if (app.getStatus() != AppointmentStatus.COMPLETED) {
                throw new ConflictException("O agendamento " + app.getId() + " não está com o status 'COMPLETED'.");
            }
            // Regra 3: Garante que o agendamento já não foi faturado
            if (app.getInvoice() != null) {
                throw new ConflictException("O agendamento " + app.getId() + " já pertence à fatura " + app.getInvoice().getId() + ".");
            }
        }

        // 4. Cálculo do Valor Total
        BigDecimal totalAmount = appointmentsToInvoice.stream()
                .map(Appointment::getChargedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 5. Criação e Persistência da Fatura
        Invoice invoice = new Invoice();
        invoice.setCustomer(customer);
        invoice.setTotalAmount(totalAmount);
        invoice.setStatus(InvoiceStatus.AWAITING_PAYMENT); // Status inicial
        invoice.setTimestamp(Instant.now());

        for (Appointment app : appointmentsToInvoice) {
            app.setInvoice(invoice);
        }
        invoice.getAppointments().addAll(appointmentsToInvoice);

        invoice = invoiceRepository.save(invoice);

        Invoice completeInvoice = invoiceRepository.findByIdWithDetails(invoice.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Fatura recém-criada não encontrada."));

        return new InvoiceDTO(completeInvoice);
    }

}