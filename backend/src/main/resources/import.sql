-- DADOS BÁSICOS E INDEPENDENTES
INSERT INTO tb_role (authority) VALUES ('ROLE_ADMIN');
INSERT INTO tb_role (authority) VALUES ('ROLE_CLIENT');
INSERT INTO tb_role (authority) VALUES ('ROLE_EMPLOYEE');

INSERT INTO tb_breed (name, species) VALUES ('Labrador', 'Cachorro');
INSERT INTO tb_breed (name, species) VALUES ('SRD (Sem Raça Definida)', 'Cachorro');
INSERT INTO tb_breed (name, species) VALUES ('Siamês', 'Gato');

INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes, active) VALUES ('Banho e Tosa Completo', 'Banho, tosa higiênica e tosa de pelagem', 80.00, 90, true);
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes, active) VALUES ('Consulta Veterinária', 'Consulta geral com avaliação de saúde e prescrição', 150.00, 30, true);
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes, active) VALUES ('Vacinação Antirrábica', 'Aplicação da vacina contra raiva', 60.00, 20, true);


-- USUÁRIOS E PERFIS
INSERT INTO tb_user ( name, email, password, user_status, phone, birth_date) VALUES ( 'Gabriel Leal', 'gabrielleal.santos16@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '75900001111', '1992-01-05');
INSERT INTO tb_user ( name, email, password, user_status, phone, birth_date) VALUES ( 'Maria Silva', 'maria@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '11999998888', '1990-06-15');
INSERT INTO tb_user ( name, email, password, user_status, phone, birth_date) VALUES ('João Santos', 'joao@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '21988887777', '1985-12-01');
INSERT INTO tb_user ( name, email, password, user_status, phone, birth_date) VALUES ( 'Joana Santos', 'joana@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '21988887778', '1985-12-01');

INSERT INTO tb_customer (user_id, cpf) VALUES (2, '12345678901'); -- Maria (user_id=2)
INSERT INTO tb_customer (user_id, cpf) VALUES (4, '15141618101'); -- Joana (user_id=4)

INSERT INTO tb_employee (user_id, job_title) VALUES (1, 'Administrator'); -- Gabriel (user_id=1)
INSERT INTO tb_employee (user_id, job_title) VALUES (3, 'Banhista');      -- João (user_id=3)

INSERT INTO tb_user_role (user_id, role_id) VALUES (1, 1); -- Gabriel ADMIN
INSERT INTO tb_user_role (user_id, role_id) VALUES (2, 2); -- Maria CLIENT
INSERT INTO tb_user_role (user_id, role_id) VALUES (3, 3); -- João EMPLOYEE
INSERT INTO tb_user_role (user_id, role_id) VALUES (4, 1); -- Joana ADMIN
INSERT INTO tb_user_role (user_id, role_id) VALUES (4, 2); -- Joana também é CLIENT

-- HABILIDADES DOS FUNCIONÁRIOS
INSERT INTO tb_employee_service (employee_id, service_id) VALUES (3, 1); -- João pode fazer Banho e Tosa
INSERT INTO tb_employee_service (employee_id, service_id) VALUES (3, 3); -- João pode aplicar Vacina


-- DADOS OPERACIONAIS (PETS, FATURAS, AGENDAMENTOS)
INSERT INTO tb_pet (name, birth_date, notes, customer_id, breed_id, ativo) VALUES ( 'Rex', '2020-05-10', 'Gosta muito de brincar com bola', 2, 1, true); -- Rex, Labrador da Maria

-- CORREÇÃO APLICADA AQUI: Inclusão do 'total_amount'
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES (2, '2025-08-10T09:00:00Z', 80.00, 'PAID'); -- Fatura para o Banho e Tosa
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES ( 2, '2025-08-19T11:00:00Z', 60.00, 'AWAITING_PAYMENT'); -- Fatura para a Vacinação
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES ( 2, '2025-08-19T11:00:00Z', 60.00, 'AWAITING_PAYMENT'); -- Fatura para a Vacinação
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES (2, '2025-08-10T09:00:00Z', 80.00, 'PAID'); -- Fatura para o Banho e Tosa
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES ( 2, '2025-08-19T11:00:00Z', 60.00, 'AWAITING_PAYMENT'); -- Fatura para a Vacinação
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES ( 2, '2025-08-19T11:00:00Z', 60.00, 'AWAITING_PAYMENT'); -- Fatura para a Vacinação
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES (2, '2025-08-10T09:00:00Z', 80.00, 'PAID'); -- Fatura para o Banho e Tosa
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES ( 2, '2025-08-19T11:00:00Z', 60.00, 'AWAITING_PAYMENT'); -- Fatura para a Vacinação
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES ( 2, '2025-08-19T11:00:00Z', 60.00, 'AWAITING_PAYMENT'); -- Fatura para a Vacinação
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES (2, '2025-08-10T09:00:00Z', 80.00, 'PAID'); -- Fatura para o Banho e Tosa
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES ( 2, '2025-08-19T11:00:00Z', 60.00, 'AWAITING_PAYMENT'); -- Fatura para a Vacinação
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES (2, '2025-09-10T09:00:00Z', 80.00, 'PAID');
INSERT INTO tb_invoice ( customer_id, timestamp, total_amount, status) VALUES (2, '2025-09-10T09:00:00Z', 80.00, 'PAID');

INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount, invoice_id) VALUES ( 1, 1, 3, '2025-08-10T10:00:00', '2025-08-10T11:30:00', 'COMPLETED', 80.00, 1);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount, invoice_id) VALUES ( 1, 3, 3, '2025-08-20T14:00:00', '2025-08-20T14:20:00', 'SCHEDULED', 60.00, 2);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount, invoice_id) VALUES (1, 2, 3, '2025-09-12T15:00:00', '2025-09-12T15:30:00', 'COMPLETED', 150.00, NULL);

-- AVALIAÇÃO (REVIEW)
INSERT INTO tb_review (appointment_id, rating, comment, review_date) VALUES (1, 5, 'O serviço foi excelente! O João foi muito cuidadoso com o Rex.', '2025-08-11T18:00:00Z');