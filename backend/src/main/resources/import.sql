-- ROLES (Estrutura mantida)
INSERT INTO tb_role (authority) VALUES ('ROLE_ADMIN');
INSERT INTO tb_role (authority) VALUES ('ROLE_CLIENT');
INSERT INTO tb_role (authority) VALUES ('ROLE_EMPLOYEE');

-- USERS (Estrutura mantida)
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Gabriel Leal', 'gabrielleal.santos16@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '75900001111', '1992-01-05');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Maria Silva', 'maria@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '11999998888', '1990-06-15');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('João Santos', 'joao@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '21988887777', '1985-12-01');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Joana Santos', 'joana@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '21988887778', '1985-12-01');

-- CUSTOMER (Estrutura mantida)
INSERT INTO tb_customer (user_id, cpf) VALUES (2, '12345678901'); -- Maria (user_id=2)
INSERT INTO tb_customer (user_id, cpf) VALUES (4, '15141618101'); -- Joana (user_id=4)

-- EMPLOYEE (Estrutura mantida)
INSERT INTO tb_employee (user_id, job_title) VALUES (1, 'Administrator'); -- Gabriel (user_id=1)
INSERT INTO tb_employee (user_id, job_title) VALUES (3, 'Banhista');      -- João (user_id=3)

-- USER_ROLE (Estrutura mantida)
INSERT INTO tb_user_role (user_id, role_id) VALUES (1, 1); -- Gabriel ADMIN
INSERT INTO tb_user_role (user_id, role_id) VALUES (2, 2); -- Maria CLIENT
INSERT INTO tb_user_role (user_id, role_id) VALUES (3, 3); -- João EMPLOYEE
INSERT INTO tb_user_role (user_id, role_id) VALUES (4, 1); -- Joana ADMIN
INSERT INTO tb_user_role (user_id, role_id) VALUES (4, 2); -- Joana também é CLIENT


-- BREEDS (NOVA TABELA)
INSERT INTO tb_breed (name, species) VALUES ('Labrador', 'Cachorro');
INSERT INTO tb_breed (name, species) VALUES ('SRD (Sem Raça Definida)', 'Cachorro');
INSERT INTO tb_breed (name, species) VALUES ('Siamês', 'Gato');

-- SERVICES (Estrutura mantida)
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes) VALUES ('Banho e Tosa Completo', 'Banho, tosa higiênica e tosa de pelagem', 80.00, 90);
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes) VALUES ('Consulta Veterinária', 'Consulta geral com avaliação de saúde e prescrição', 150.00, 30);
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes) VALUES ('Vacinação Antirrábica', 'Aplicação da vacina contra raiva', 60.00, 20);

-- PET (CORRIGIDO para usar breed_id)
INSERT INTO tb_pet (name, birth_date, notes, customer_id, breed_id, ativo) VALUES ('Rex', '2020-05-10', 'Gosta muito de brincar com bola', 2, 1, true); -- Rex é um Labrador (breed_id=1)

-- INVOICES
-- Fatura para o Banho e Tosa do Rex
INSERT INTO tb_invoice (customer_id, timestamp, status) VALUES (2, '2025-08-10T09:00:00Z', 'PAID');
-- Fatura para a Vacinação do Rex
INSERT INTO tb_invoice (customer_id, timestamp, status) VALUES (2, '2025-08-19T11:00:00Z', 'AWAITING_PAYMENT');

-- APPOINTMENTS (CORRIGIDO para incluir invoice_id)
-- Agendamento de Banho e Tosa (Fatura 1), status alterado para COMPLETED para permitir avaliação
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount, invoice_id) VALUES (1, 1, 3, '2025-08-10T10:00:00', '2025-08-10T11:30:00', 'COMPLETED', 80.00, 1);
-- Agendamento de Vacinação (Fatura 2)
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount, invoice_id) VALUES (1, 3, 3, '2025-08-20T14:00:00', '2025-08-20T14:20:00', 'SCHEDULED', 60.00, 2);


INSERT INTO tb_review (appointment_id, rating, comment, review_date) VALUES (1, 5, 'O serviço foi excelente! O João foi muito cuidadoso com o Rex.', '2025-08-11T18:00:00Z');