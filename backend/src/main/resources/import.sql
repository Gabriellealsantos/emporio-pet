-- DADOS BÁSICOS E INDEPENDENTES
INSERT INTO tb_role (authority) VALUES ('ROLE_ADMIN'), ('ROLE_CLIENT'), ('ROLE_EMPLOYEE');

INSERT INTO tb_breed (name, species) VALUES ('Labrador', 'CACHORRO'), ('SRD', 'CACHORRO'), ('Siamês', 'GATO'), ('Persa', 'GATO');

INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes, active) VALUES ('Banho e Tosa Completo', 'Banho, tosa higiênica e tosa de pelagem', 95.00, 90, true);
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes, active) VALUES ('Consulta Veterinária', 'Consulta geral com avaliação de saúde', 150.00, 30, true);
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes, active) VALUES ('Vacinação V10', 'Aplicação da vacina polivalente V10', 80.00, 20, true);
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes, active) VALUES ('Banho Simples', 'Apenas um banho rápido e secagem', 60.00, 60, true);

-- USUÁRIOS (Admin, Clientes, Funcionários)
-- Senha para todos: '12345678'
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Gabriel Leal (Admin)', 'admin@pet.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '11911111111', '1990-01-01');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Maria Silva (Cliente)', 'maria@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '11922222222', '1992-06-15');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('João Santos (Banhista)', 'joao@pet.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '11933333333', '1995-12-01');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Ana Costa (Veterinária)', 'ana@pet.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '11944444444', '1993-10-20');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Carlos Oliveira (Caixa)', 'caixa@pet.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '11955555555', '1998-03-03');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Pedro Lima (Cliente)', 'pedro@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '11966666666', '1988-07-22');

-- PERFIS
INSERT INTO tb_customer (user_id, cpf) VALUES (2, '11122233344'), (6, '55566677788');
INSERT INTO tb_employee (user_id, job_title) VALUES (1, 'Administrator'), (3, 'Banhista'), (4, 'Veterinária'), (5, 'Caixa');

-- ASSOCIAÇÃO DE PERFIS (ROLES)
INSERT INTO tb_user_role (user_id, role_id) VALUES (1, 1), (2, 2), (3, 3), (4, 3), (5, 3), (6, 2);
INSERT INTO tb_user_role (user_id, role_id) VALUES (1); -- Admin também é funcionário

-- HABILIDADES DOS FUNCIONÁRIOS
INSERT INTO tb_employee_service (employee_id, service_id) VALUES (3, 1), (3, 4); -- João (Banhista) faz Banho e Tosa e Banho Simples
INSERT INTO tb_employee_service (employee_id, service_id) VALUES (4, 2), (4, 3); -- Ana (Veterinária) faz Consulta e Vacinação

-- PETS
INSERT INTO tb_pet (name, birth_date, notes, customer_id, breed_id, ativo) VALUES ('Rex', '2020-05-10', 'Labrador brincalhão', 2, 1, true);
INSERT INTO tb_pet (name, birth_date, notes, customer_id, breed_id, ativo) VALUES ('Luna', '2021-01-15', 'Siamês um pouco arisca', 2, 3, true);
INSERT INTO tb_pet (name, birth_date, notes, customer_id, breed_id, ativo) VALUES ('Thor', '2019-11-01', 'SRD muito dócil', 6, 2, true);

-- AGENDAMENTOS E FATURAS (Lembre-se que a data atual é 16 de Setembro de 2025)

-- Cenário 1: Serviço antigo, faturado, pago e com avaliação.
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (1, 4, 3, '2025-08-10T10:00:00', '2025-08-10T11:00:00', 'COMPLETED', 60.00);
INSERT INTO tb_invoice (customer_id, timestamp, total_amount, status) VALUES (2, '2025-08-10T11:05:00Z', 60.00, 'PAID');
UPDATE tb_appointment SET invoice_id = 1 WHERE id = 1;
INSERT INTO tb_review (appointment_id, rating, comment, review_date) VALUES (1, 5, 'O João foi excelente com o Rex, como sempre!', '2025-08-11T18:00:00Z');

-- Cenário 2: Serviço antigo, faturado, aguardando pagamento.
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (3, 1, 3, '2025-08-25T14:00:00', '2025-08-25T15:30:00', 'COMPLETED', 95.00);
INSERT INTO tb_invoice (customer_id, timestamp, total_amount, status) VALUES (6, '2025-08-25T15:35:00Z', 95.00, 'AWAITING_PAYMENT');
UPDATE tb_appointment SET invoice_id = 2 WHERE id = 2;

-- Cenário 3: Serviço concluído HOJE, ainda NÃO faturado (para a tela do Caixa).
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (2, 2, 4, '2025-09-16T09:00:00', '2025-09-16T09:30:00', 'COMPLETED', 150.00);

-- Cenário 4: Agendamento para HOJE, status EM ANDAMENTO (para o dashboard da Ana).
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (3, 3, 4, '2025-09-16T11:00:00', '2025-09-16T11:20:00', 'IN_PROGRESS', 80.00);

-- Cenário 5: Agendamento para HOJE, status AGENDADO (para o dashboard do João).
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (1, 1, 3, '2025-09-16T16:00:00', '2025-09-16T17:30:00', 'SCHEDULED', 95.00);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (3, 1, 3, '2025-07-01T10:00:00', '2025-07-01T11:30:00', 'COMPLETED', 95.00);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (1, 4, 3, '2025-07-02T10:00:00', '2025-07-02T11:00:00', 'COMPLETED', 60.00);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (2, 4, 3, '2025-07-03T10:00:00', '2025-07-03T11:00:00', 'COMPLETED', 60.00);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (3, 4, 3, '2025-07-04T10:00:00', '2025-07-04T11:00:00', 'COMPLETED', 60.00);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (1, 1, 3, '2025-07-05T10:00:00', '2025-07-05T11:30:00', 'COMPLETED', 95.00);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (2, 1, 3, '2025-07-06T10:00:00', '2025-07-06T11:30:00', 'COMPLETED', 95.00);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (3, 1, 3, '2025-07-07T10:00:00', '2025-07-07T11:30:00', 'COMPLETED', 95.00);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (1, 4, 3, '2025-07-08T10:00:00', '2025-07-08T11:00:00', 'COMPLETED', 60.00);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (2, 4, 3, '2025-07-09T10:00:00', '2025-07-09T11:00:00', 'COMPLETED', 60.00);

-- Cenário 6: Fatura paga no mês atual (Setembro) para o Dashboard do Admin.
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (2, 3, 4, '2025-09-05T10:00:00', '2025-09-05T10:20:00', 'COMPLETED', 80.00);
INSERT INTO tb_invoice (customer_id, timestamp, total_amount, status) VALUES (2, '2025-09-05T10:30:00Z', 80.00, 'PAID');
UPDATE tb_appointment SET invoice_id = 3 WHERE id = 6;