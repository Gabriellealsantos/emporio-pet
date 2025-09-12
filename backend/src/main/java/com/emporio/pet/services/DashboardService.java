package com.emporio.pet.services;

import com.emporio.pet.dto.DashboardDTO;
import com.emporio.pet.dto.RecentActivityDTO;
import com.emporio.pet.entities.Appointment;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.repositories.AppointmentRepository;
import com.emporio.pet.repositories.CustomerRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.print.Pageable;
import java.math.BigDecimal;
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

    public DashboardService(AppointmentRepository appointmentRepository, CustomerRepository customerRepository) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
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
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);
        int novosClientesMes = customerRepository.countByCreationTimestampBetween(currentMonth.atDay(1).atStartOfDay().atZone(ZoneId.systemDefault()).toInstant(), currentMonth.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());
        int novosClientesMesPassado = customerRepository.countByCreationTimestampBetween(lastMonth.atDay(1).atStartOfDay().atZone(ZoneId.systemDefault()).toInstant(), lastMonth.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());
        dto.setNovosClientesMes(novosClientesMes);
        dto.setNovosClientesMesVsPassado(calculatePercentageChange(novosClientesMesPassado, novosClientesMes));

        // --- 3. Lógica de Faturamento ---
        BigDecimal faturamentoMes = appointmentRepository.sumCompletedAppointmentsByDate(currentMonth.atDay(1).atStartOfDay(), currentMonth.atEndOfMonth().atTime(23, 59, 59));
        BigDecimal faturamentoMesPassado = appointmentRepository.sumCompletedAppointmentsByDate(lastMonth.atDay(1).atStartOfDay(), lastMonth.atEndOfMonth().atTime(23, 59, 59));

        // Garante que não seja nulo se não houver faturamento
        dto.setFaturamentoMes(faturamentoMes == null ? BigDecimal.ZERO : faturamentoMes);
        dto.setFaturamentoMesVsPassado(calculatePercentageChange(faturamentoMesPassado, faturamentoMes));

        List<RecentActivityDTO> recentActivities = new ArrayList<>();

        List<Customer> recentCustomers = customerRepository.findTop5ByOrderByCreationTimestampDesc();
        recentCustomers.forEach(customer -> {
            RecentActivityDTO activity = new RecentActivityDTO();
            activity.setType("NEW_CUSTOMER");
            activity.setTitle("Novo cliente cadastrado");
            activity.setDescription(customer.getName() +
                    " - Pet: " + (customer.getPets().isEmpty() ? "N/A" : customer.getPets().get(0).getName()));
            activity.setTimestamp(customer.getCreationTimestamp());
            recentActivities.add(activity);
        });

// Busca últimos 5 agendamentos
        List<Appointment> recentAppointments = appointmentRepository.findTop5ByOrderByStartDateTimeDesc();
        recentAppointments.forEach(app -> {
            RecentActivityDTO activity = new RecentActivityDTO();
            activity.setType("APPOINTMENT");
            activity.setTitle("Agendamento: " + app.getStatus().toString().toLowerCase());
            activity.setDescription(app.getService().getName() + " para " + app.getPet().getName());
            activity.setTimestamp(app.getStartDateTime().atZone(ZoneId.systemDefault()).toInstant());
            recentActivities.add(activity);
        });

        List<RecentActivityDTO> sortedActivities = recentActivities.stream()
                .sorted(Comparator.comparing(RecentActivityDTO::getTimestamp,
                                Comparator.nullsLast(Comparator.naturalOrder()))
                        .reversed()) // Ordena normalmente e joga os nulos para o final
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