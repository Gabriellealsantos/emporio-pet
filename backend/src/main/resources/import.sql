-- ROLES
INSERT INTO tb_role (authority) VALUES ('ROLE_ADMIN');
INSERT INTO tb_role (authority) VALUES ('ROLE_CLIENT');
INSERT INTO tb_role (authority) VALUES ('ROLE_EMPLOYEE');

-- USERS (com a coluna DTYPE para a herança)
-- DTYPE informa ao JPA qual é a subclasse: 'Customer' ou 'Employee'
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Gabriel Leal', 'gabrielleal.santos16@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '75900001111', '1992-01-05');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Maria Silva', 'maria@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '11999998888', '1990-06-15');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('João Santos', 'joao@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '21988887777', '1985-12-01');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Joana Santos', 'joana@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '21988887777', '1985-12-01');
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Jhoan Maia', 'jhoan@gmail.com', '$2a$10$mIHRZwT3w/U7jsffXI2vcuTN0QTwbqzhZ4mdcPOd7vXuFxLaewI0u', 'NON_BLOCKED', '21988887777', '1985-12-01');

-- CUSTOMER (agora apenas com os dados específicos)
INSERT INTO tb_customer (user_id, cpf) VALUES (2, '12345678901'); -- Maria (user_id=2)
INSERT INTO tb_customer (user_id, cpf) VALUES (4, '15141618101'); -- Joana (user_id=4)
INSERT INTO tb_customer (user_id, cpf) VALUES (5, '14151816121'); -- Jhoan (user_id=5)

-- EMPLOYEE (agora apenas com os dados específicos)
INSERT INTO tb_employee (user_id, job_title) VALUES (1, 'Administrator'); -- Gabriel (user_id=1), que é admin, precisa de um registro aqui
INSERT INTO tb_employee (user_id, job_title) VALUES (3, 'Podador');      -- João (user_id=3)

-- USER_ROLE (ligação entre usuários e papéis)
INSERT INTO tb_user_role (user_id, role_id) VALUES (1, 1); -- Gabriel ADMIN
INSERT INTO tb_user_role (user_id, role_id) VALUES (2, 2); -- Maria CLIENT
INSERT INTO tb_user_role (user_id, role_id) VALUES (3, 3); -- João EMPLOYEE
INSERT INTO tb_user_role (user_id, role_id) VALUES (4, 1); -- Joana ADMIN
INSERT INTO tb_user_role (user_id, role_id) VALUES (4, 2); -- Joana também é CLIENT
INSERT INTO tb_user_role (user_id, role_id) VALUES (5, 1); -- Jhoan ADMIN
INSERT INTO tb_user_role (user_id, role_id) VALUES (5, 2); -- Jhoan também é CLIENT

-- CATEGORIES
INSERT INTO tb_category (name) VALUES ('Rações');
INSERT INTO tb_category (name) VALUES ('Brinquedos');
INSERT INTO tb_category (name) VALUES ('Higiene');
-- PRODUCTS (sem a coluna category_id)
INSERT INTO tb_product (name, description, price, stock_quantity, image_url) VALUES ('Ração Premium Cães Adultos', 'Ração seca premium para cães adultos de médio porte', 120.50, 50, 'https://img.exemplo.com/racao-premium.jpg');
INSERT INTO tb_product (name, description, price, stock_quantity, image_url) VALUES ('Brinquedo Bola Interativa', 'Bola com dispenser de petiscos para cães e gatos', 35.90, 100, 'https://img.exemplo.com/bola-interativa.jpg');
INSERT INTO tb_product (name, description, price, stock_quantity, image_url) VALUES ('Shampoo Neutro', 'Shampoo para todos os tipos de pelo', 45.00, 80, 'https://img.exemplo.com/shampoo.jpg');

-- RELACIONAMENTO PRODUTO-CATEGORIA (usando a tabela de junção)
INSERT INTO tb_product_category (product_id, category_id) VALUES (1, 1); -- Ração Premium -> Rações
INSERT INTO tb_product_category (product_id, category_id) VALUES (2, 2); -- Bola Interativa -> Brinquedos
INSERT INTO tb_product_category (product_id, category_id) VALUES (3, 3); -- Shampoo Neutro -> Higiene

-- SERVICES
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes) VALUES ('Banho e Tosa Completo', 'Banho, tosa higiênica e tosa de pelagem', 80.00, 90);
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes) VALUES ('Consulta Veterinária', 'Consulta geral com avaliação de saúde e prescrição', 150.00, 30);
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes) VALUES ('Vacinação Antirrábica', 'Aplicação da vacina contra raiva', 60.00, 20);

-- PET
INSERT INTO tb_pet (name, species, breed, birth_date, notes, customer_id) VALUES ('Rex', 'Cachorro', 'Labrador', '2020-05-10', 'Gosta muito de brincar com bola', 2);

-- ADDRESS
INSERT INTO tb_address (city, neighborhood, public_place, customer_id) VALUES ('São Paulo', 'Centro', 'Rua das Flores, 123', 2);

-- APPOINTMENTS
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (1, 1, 3, '2025-08-10T10:00:00', '2025-08-10T11:30:00', 'SCHEDULED', 80.00);
INSERT INTO tb_appointment (pet_id, service_id, employee_id, start_date_time, end_date_time, status, charged_amount) VALUES (1, 3, 3, '2025-08-20T14:00:00', '2025-08-20T14:20:00', 'SCHEDULED', 60.00);

-- ORDERS
INSERT INTO tb_order (customer_id, timestamp, total_price, status) VALUES (2, '2025-08-14T15:00:00', 156.40, 'PAID');
INSERT INTO tb_order_item (order_id, product_id, appointment_id) VALUES (1, 1, NULL);
INSERT INTO tb_order_item (order_id, product_id, appointment_id) VALUES (1, 2, NULL);
INSERT INTO tb_payment (order_id, timestamp, payment_method, status) VALUES (1, '2025-08-14T15:01:00', 'CREDIT_CARD', 'APPROVED');

INSERT INTO tb_order (customer_id, timestamp, total_price, status) VALUES (4, '2025-08-14T15:05:00', 80.00, 'PAID');

INSERT INTO tb_order_item (order_id, product_id, appointment_id) VALUES (2, NULL, 1);
INSERT INTO tb_payment (order_id, timestamp, payment_method, status) VALUES (2, '2025-08-14T15:06:00', 'PIX', 'APPROVED');

INSERT INTO tb_order (customer_id, timestamp, total_price, status) VALUES (5, '2025-08-14T15:10:00', 105.00, 'PAID');
-- CORREÇÃO APLICADA AQUI
INSERT INTO tb_order_item (order_id, product_id, appointment_id) VALUES (3, 3, NULL);
INSERT INTO tb_order_item (order_id, product_id, appointment_id) VALUES (3, NULL, 2);
INSERT INTO tb_payment (order_id, timestamp, payment_method, status) VALUES (3, '2025-08-14T15:11:00', 'DEBIT_CARD', 'APPROVED');







