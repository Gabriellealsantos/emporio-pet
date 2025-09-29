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

    /**
     * Retorna a fatura pelo ID após validar permissão de acesso.
     */
    @Transactional(readOnly = true)
    public InvoiceDTO findById(Long invoiceId) {
        if (!authService.canAccessInvoice(invoiceId)) {
            throw new ForbiddenException("Acesso negado.");
        }

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura não encontrada com o ID: " + invoiceId));

        return new InvoiceDTO(invoice);
    }

    /**
     * Lista faturas com filtros; se o usuário autenticado for cliente, limita ao próprio cliente.
     */
    @Transactional(readOnly = true)
    public Page<InvoiceDTO> find(Pageable pageable, Long customerId, Instant minDate, Instant maxDate, InvoiceStatus status) {

        User authenticatedUser = authService.authenticated();
        if (authenticatedUser.hasRole("ROLE_CLIENT")) {
            customerId = authenticatedUser.getId();
        }

        Page<Invoice> page = invoiceRepository.findFiltered(pageable, customerId, minDate, maxDate, status);

        return page.map(InvoiceDTO::new);
    }

    /**
     * Cria uma nova fatura a partir de agendamentos: valida permissões, consistência e persiste a fatura.
     */
    @Transactional
    public InvoiceDTO create(InvoiceCreateDTO dto) {
        User authenticatedUser = authService.authenticated();
        if (!authenticatedUser.hasRole("ROLE_EMPLOYEE") && !authenticatedUser.hasRole("ROLE_ADMIN")) {
            throw new ForbiddenException("Acesso negado. Apenas funcionários ou administradores podem criar faturas.");
        }

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com o ID: " + dto.getCustomerId()));

        List<Appointment> appointmentsToInvoice = appointmentRepository.findAllById(dto.getAppointmentIds());

        if (appointmentsToInvoice.size() != dto.getAppointmentIds().size()) {
            throw new ResourceNotFoundException("Um ou mais agendamentos não foram encontrados.");
        }

        for (Appointment app : appointmentsToInvoice) {
            if (!app.getPet().getOwner().getId().equals(customer.getId())) {
                throw new ConflictException("O agendamento " + app.getId() + " não pertence ao cliente informado.");
            }
            if (app.getStatus() != AppointmentStatus.COMPLETED) {
                throw new ConflictException("O agendamento " + app.getId() + " não está com o status 'COMPLETED'.");
            }
            if (app.getInvoice() != null) {
                throw new ConflictException("O agendamento " + app.getId() + " já pertence à fatura " + app.getInvoice().getId() + ".");
            }
        }

        BigDecimal totalAmount = appointmentsToInvoice.stream()
                .map(Appointment::getChargedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Invoice invoice = new Invoice();
        invoice.setCustomer(customer);
        invoice.setTotalAmount(totalAmount);
        invoice.setStatus(InvoiceStatus.AWAITING_PAYMENT);
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


    /**
     * Marca uma fatura como paga, verificando estados inválidos antes da alteração.
     */
    @Transactional
    public InvoiceDTO markAsPaid(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura não encontrada com o ID: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new ConflictException("Esta fatura já foi paga.");
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELED) {
            throw new ConflictException("Não é possível pagar uma fatura cancelada.");
        }

        invoice.setStatus(InvoiceStatus.PAID);

        invoice = invoiceRepository.save(invoice);

        return new InvoiceDTO(invoice);
    }

    /**
     * Lista faturas com filtros, incluindo uma busca "inteligente" por nome ou CPF do cliente.
     */
    @Transactional(readOnly = true)
    public Page<InvoiceDTO> find(Pageable pageable, String searchTerm, Instant minDate, Instant maxDate, InvoiceStatus status) {

        String customerName = null;
        String customerCpf = null;

        // Lógica para determinar se o termo de busca é um nome ou um CPF
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            // Remove todos os caracteres não numéricos. Se o resultado for um CPF válido, usamos a busca por CPF.
            String numericTerm = searchTerm.replaceAll("[^0-9]", "");
            if (numericTerm.length() > 0) { // Pode ajustar para .length() == 11 se quiser ser mais estrito
                customerCpf = numericTerm;
            } else {
                customerName = searchTerm;
            }
        }

        // Chama o nosso novo e único método do repositório
        Page<Invoice> page = invoiceRepository.findFiltered(pageable, customerName, customerCpf, minDate, maxDate, status);

        return page.map(InvoiceDTO::new);
    }

}
