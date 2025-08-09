-- ROLES (caso ainda não existam)
INSERT INTO tb_role (authority) VALUES ('ROLE_ADMIN');
INSERT INTO tb_role (authority) VALUES ('ROLE_CLIENT');
INSERT INTO tb_role (authority) VALUES ('ROLE_EMPLOYEE');

-- USERS
INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Gabriel Leal', 'gabriel@gmail.com', '$2a$10$eACCYoNOHEqXve8aIWT8Nu3PkMXWBaOxJ9aORUYzfMQCbVBIhZ8tG', 'NON_BLOCKED', '75900001111', TIMESTAMP '1992-01-05T00:00:00.12345Z');

INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Maria Silva', 'maria@gmail.com', '$2a$10$eACCYoNOHEqXve8aIWT8Nu3PkMXWBaOxJ9aORUYzfMQCbVBIhZ8tG', 'NON_BLOCKED', '11999998888', TIMESTAMP '1990-06-15T00:00:00.00000Z');

INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('João Santos', 'joao@gmail.com', '$2a$10$eACCYoNOHEqXve8aIWT8Nu3PkMXWBaOxJ9aORUYzfMQCbVBIhZ8tG', 'NON_BLOCKED', '21988887777', TIMESTAMP '1985-12-01T00:00:00.00000Z');

INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Joana Santos', 'joana@gmail.com', '$2a$10$eACCYoNOHEqXve8aIWT8Nu3PkMXWBaOxJ9aORUYzfMQCbVBIhZ8tG', 'NON_BLOCKED', '21988887777', TIMESTAMP '1985-12-01T00:00:00.00000Z');

INSERT INTO tb_user (name, email, password, user_status, phone, birth_date) VALUES ('Jhoan Maia', 'jhoan@gmail.com', '$2a$10$eACCYoNOHEqXve8aIWT8Nu3PkMXWBaOxJ9aORUYzfMQCbVBIhZ8tG', 'NON_BLOCKED', '21988887777', TIMESTAMP '1985-12-01T00:00:00.00000Z');

-- CUSTOMER (Maria será cliente)
INSERT INTO tb_customer (cpf, user_id) VALUES ('12345678901', 2);
INSERT INTO tb_customer (cpf, user_id) VALUES ('15141618101', 4);
INSERT INTO tb_customer (cpf, user_id) VALUES ('14151816121', 5);

-- EMPLOYEE (João será funcionário)
INSERT INTO tb_employee (job_title, user_id) VALUES ('Podador', 3);

-- ADDRESS para Maria (customer_id = 1 pois ela foi inserida logo após os users no exemplo anterior)
INSERT INTO tb_address (city, neighborhood, public_place, customer_id) VALUES ('São Paulo', 'Centro', 'Rua das Flores, 123', 1);

-- PET para Maria
INSERT INTO tb_pet (name, species, breed, birth_date, notes, customer_id) VALUES ('Rex', 'Cachorro', 'Labrador', DATE '2020-05-10', 'Gosta muito de brincar com bola', 1);

-- USER_ROLE
INSERT INTO tb_user_role (user_id, role_id) VALUES (1, 1); -- Gabriel ADMIN
INSERT INTO tb_user_role (user_id, role_id) VALUES (2, 2); -- Maria CLIENT
INSERT INTO tb_user_role (user_id, role_id) VALUES (3, 3); -- João EMPLOYEE

-- CATEGORIAS DE BRINQUEDO
INSERT INTO tb_category (name) VALUES ('Rações');
INSERT INTO tb_category (name) VALUES ('Brinquedos');
INSERT INTO tb_category (name) VALUES ('Serviços Veterinários');

-- 2️⃣ Produtos
INSERT INTO tb_product (name, description, price, stock_quantity, image_url) VALUES ('Ração Premium Cães Adultos', 'Ração seca premium para cães adultos de médio porte', 120.50, 50, 'https://img.exemplo.com/racao-premium.jpg');

INSERT INTO tb_product (name, description, price, stock_quantity, image_url) VALUES ('Brinquedo Bola Interativa', 'Bola com dispenser de petiscos para cães e gatos', 35.90, 100, 'https://img.exemplo.com/bola-interativa.jpg');

INSERT INTO tb_product (name, description, price, stock_quantity, image_url) VALUES ('Consulta Veterinária', 'Atendimento veterinário completo com check-up', 150.00, 0, 'https://img.exemplo.com/consulta-vet.jpg');

-- 3️⃣ Relacionamentos (tb_product_category)
-- Produto 1 -> Categoria Rações
INSERT INTO tb_product_category (product_id, category_id) VALUES (1, 1);

-- Produto 2 -> Categoria Brinquedos
INSERT INTO tb_product_category (product_id, category_id) VALUES (2, 2);

-- Produto 3 -> Categoria Serviços Veterinários
INSERT INTO tb_product_category (product_id, category_id) VALUES (3, 3);

-- Serviços
INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes) VALUES ('Banho e Tosa Completo', 'Banho, tosa higiênica e tosa de pelagem', 80.00, 90);

INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes) VALUES ('Consulta Veterinária', 'Consulta geral com avaliação de saúde e prescrição', 150.00, 30);

INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes) VALUES ('Vacinação Antirrábica', 'Aplicação da vacina contra raiva para cães e gatos', 60.00, 20);

INSERT INTO tb_service (name, description, price, estimated_duration_in_minutes) VALUES ('Hospedagem Diária', 'Hospedagem com alimentação e acompanhamento 24h', 120.00, 1440);

-- Pedido 1: Apenas produtos (cliente 1)
INSERT INTO tb_order (customer_id, timestamp, total_price, status) VALUES (1, NOW(), 180.00, 'PAID');

INSERT INTO tb_order_item (order_id, product_id, appointment_id) VALUES (1, 1, NULL);
INSERT INTO tb_order_item (order_id, product_id, appointment_id) VALUES (1, 2, NULL); -- Brinquedo mordedor

INSERT INTO tb_payment (order_id, timestamp, payment_method, status) VALUES (1, NOW(), 'CREDIT_CARD', 'APPROVED');

-- Pedido 2: Apenas serviço (cliente 2)
INSERT INTO tb_appointment (start_date_time, end_date_time, status, charged_amount, pet_id, service_id, employee_id) VALUES (TIMESTAMP '2025-08-10T10:00:00', TIMESTAMP '2025-08-10T10:30:00', 'SCHEDULED', 80.00, 1, 1, 1);

INSERT INTO tb_order (customer_id, timestamp, total_price, status) VALUES (2, NOW(), 80.00, 'PAID');

INSERT INTO tb_order_item (order_id, product_id, appointment_id) VALUES (2, NULL, 1);

INSERT INTO tb_payment (order_id, timestamp, payment_method, status) VALUES (2, NOW(), 'CREDIT_CARD', 'APPROVED');

-- Pedido 3: Misto (cliente 3)
INSERT INTO tb_appointment (start_date_time, end_date_time, status, charged_amount, pet_id, service_id, employee_id) VALUES (TIMESTAMP '2025-08-10 10:00:00', TIMESTAMP '2025-08-10 10:30:00', 'SCHEDULED', 80.00, 1, 1, 1); SELECT id FROM tb_appointment ORDER BY id DESC LIMIT 1;
INSERT INTO tb_order (customer_id, timestamp, total_price, status) VALUES (3, NOW(), 230.00, 'PAID');

INSERT INTO tb_order_item (order_id, product_id, appointment_id) VALUES (3, 3, NULL); -- Coleira ajustável
INSERT INTO tb_order_item (order_id, product_id, appointment_id) VALUES  (3, NULL, 2);  -- Agendamento de vacinação

INSERT INTO tb_payment (order_id, timestamp, payment_method, status) VALUES (3, NOW(), 'PIX', 'APPROVED');



