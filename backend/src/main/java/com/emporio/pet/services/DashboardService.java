package com.emporio.pet.services;

import com.emporio.pet.dto.DashboardDTO;
import com.emporio.pet.dto.RecentActivityDTO;
import com.emporio.pet.entities.Appointment;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.enums.InvoiceStatus;
import com.emporio.pet.repositories.AppointmentRepository;
import com.emporio.pet.repositories.CustomerRepository;
import com.emporio.pet.repositories.InvoiceRepository;
import com.emporio.pet.repositories.PetRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.print.Pageable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final PetRepository petRepository;

    public DashboardService(AppointmentRepository appointmentRepository,
                            CustomerRepository customerRepository,
                            InvoiceRepository invoiceRepository,
                            PetRepository petRepository) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
        this.petRepository = petRepository;
    }

    @Transactional(readOnly = true)
    public DashboardDTO getDashboardData() {
        DashboardDTO dto = new DashboardDTO();

        // --- 1. Lógica de Agendamentos ---
        LocalDate today = LocalDate.now();
        int agendamentosHoje = appointmentRepository.countByStartDateTimeBetween(today.atStartOfDay(), today.atTime(23, 59, 59));
        int agendamentosOntem = appointmentRepository.countByStartDateTimeBetween(today.minusDays(1).atStartOfDay(), today.minusDays(1).atTime(23, 59, 59));
        dto.setAgendamentosHoje(agendamentosHoje);
        dto.setAgendamentosHojeVsOntem(calculatePercentageChange(agendamentosOntem, agendamentosHoje));

        // --- 2. Lógica de Novos Clientes ---
        YearMonth currentMonthCustomer = YearMonth.now();
        YearMonth lastMonthCustomer = currentMonthCustomer.minusMonths(1);
        int novosClientesMes = customerRepository.countByCreationTimestampBetween(currentMonthCustomer.atDay(1).atStartOfDay().atZone(ZoneId.systemDefault()).toInstant(), currentMonthCustomer.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());
        int novosClientesMesPassado = customerRepository.countByCreationTimestampBetween(lastMonthCustomer.atDay(1).atStartOfDay().atZone(ZoneId.systemDefault()).toInstant(), lastMonthCustomer.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());
        dto.setNovosClientesMes(novosClientesMes);
        dto.setNovosClientesMesVsPassado(calculatePercentageChange(novosClientesMesPassado, novosClientesMes));

        // --- 3. Lógica de Faturamento (COM CORREÇÃO) ---
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);

        Instant startOfCurrentMonth = currentMonth.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        // 👇 CORREÇÃO: Usar 'currentMonth' para o fim do mês atual, não 'lastMonthInvoice'
        Instant endOfCurrentMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

        Instant startOfLastMonth = lastMonth.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfLastMonth = lastMonth.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

        BigDecimal faturamentoMes = invoiceRepository.sumPaidInvoicesByDate(InvoiceStatus.PAID, startOfCurrentMonth, endOfCurrentMonth);
        BigDecimal faturamentoMesPassado = invoiceRepository.sumPaidInvoicesByDate(InvoiceStatus.PAID, startOfLastMonth, endOfLastMonth);

        dto.setFaturamentoMes(faturamentoMes == null ? BigDecimal.ZERO : faturamentoMes);
        dto.setFaturamentoMesVsPassado(calculatePercentageChange(faturamentoMesPassado, faturamentoMes));

        // --- 4. Lógica de Atividades Recentes (MELHORADA) ---
        List<RecentActivityDTO> recentActivities = new ArrayList<>();

        // Atividade 1: Novos clientes
        customerRepository.findTop5ByOrderByCreationTimestampDesc().forEach(customer -> {
            RecentActivityDTO activity = new RecentActivityDTO();
            activity.setType("NEW_CUSTOMER");
            activity.setTitle("Novo cliente cadastrado");
            activity.setDescription(customer.getName());
            activity.setTimestamp(customer.getCreationTimestamp());
            recentActivities.add(activity);
        });

        // Atividade 2: Últimos agendamentos
        appointmentRepository.findTop5ByOrderByStartDateTimeDesc().forEach(app -> {
            RecentActivityDTO activity = new RecentActivityDTO();
            activity.setType("APPOINTMENT");
            activity.setTitle("Agendamento: " + app.getStatus().toString().toLowerCase());
            activity.setDescription(app.getService().getName() + " para " + app.getPet().getName());
            activity.setTimestamp(app.getStartDateTime().atZone(ZoneId.systemDefault()).toInstant());
            recentActivities.add(activity);
        });

        // 4. NOVO: Atividade 3: Faturas Pagas
        invoiceRepository.findTop5ByStatusOrderByTimestampDesc(InvoiceStatus.PAID).forEach(invoice -> {
            RecentActivityDTO activity = new RecentActivityDTO();
            activity.setType("INVOICE_PAID");
            activity.setTitle("Fatura Paga");
            activity.setDescription("Fatura #" + invoice.getId() + " de " + invoice.getCustomer().getName());
            activity.setTimestamp(invoice.getTimestamp());
            recentActivities.add(activity);
        });

        // 5. NOVO: Atividade 4: Novos Pets Cadastrados
        petRepository.findTop5ByOrderByIdDesc().forEach(pet -> {
            RecentActivityDTO activity = new RecentActivityDTO();
            activity.setType("NEW_PET");
            activity.setTitle("Novo pet cadastrado");
            activity.setDescription(pet.getName() + " (Dono(a): " + pet.getOwner().getName() + ")");
            // Pet não tem timestamp, então usamos o do dono como uma aproximação para ordenação.
            // Em um sistema real, o ideal seria que Pet também tivesse um 'creationTimestamp'.
            activity.setTimestamp(pet.getOwner().getCreationTimestamp());
            recentActivities.add(activity);
        });

        // Ordena a lista combinada de todas as atividades e pega as 5 mais recentes
        List<RecentActivityDTO> sortedActivities = recentActivities.stream()
                .sorted(Comparator.comparing(RecentActivityDTO::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .collect(Collectors.toList());

        dto.setRecentActivities(sortedActivities);

        return dto;
    }


    // Método auxiliar para calcular a variação percentual
    private double calculatePercentageChange(Number oldValue, Number newValue) {
        double oldVal = (oldValue == null) ? 0.0 : oldValue.doubleValue();
        double newVal = (newValue == null) ? 0.0 : newValue.doubleValue();
        if (oldVal == 0) {
            return (newVal > 0) ? 100.0 : 0.0; // Crescimento infinito ou zero
        }
        return ((newVal - oldVal) / oldVal) * 100.0;
    }
}