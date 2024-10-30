CREATE DATABASE agendamento_medico;
USE agendamento_medico;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('paciente', 'medico') NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT
);

CREATE TABLE medicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    especialidade_id INT NULL, 
    crm VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE SET NULL
);

CREATE TABLE pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    endereco TEXT,
    telefone VARCHAR(15),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medico_id INT NOT NULL,
    dia_semana ENUM('segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo') NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE CASCADE
);

CREATE TABLE consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    medico_id INT NOT NULL,
    especialidade_id INT NULL,
    data_consulta DATE NOT NULL,
    horario_consulta TIME NOT NULL,
    status ENUM('agendada', 'realizada', 'cancelada') DEFAULT 'agendada',
    observacoes TEXT,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE CASCADE,
    FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE SET NULL
);

CREATE TABLE password_resets (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL
);

INSERT INTO especialidades (nome, descricao) VALUES
('Cardiologista', 'Especialista em doenças do coração e sistema circulatório.'),
('Psiquiatra', 'Especialista em saúde mental e distúrbios emocionais.'),
('Dermatologista', 'Especialista em doenças de pele.');

INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Usuario1', 'usuario1@example.com', 'senha1', 'paciente'),
('Usuario2', 'usuario2@example.com', 'senha2', 'medico'),
('Usuario3', 'usuario3@example.com', 'senha3', 'medico');

INSERT INTO medicos (usuario_id, especialidade_id, crm) VALUES
(2, 1, 'CRM12345'),
(3, 2, 'CRM67890');




INSERT INTO horarios (medico_id, dia_semana, horario_inicio, horario_fim) VALUES
(1, 'segunda', '08:00:00', '12:00:00'),
(1, 'quarta', '13:00:00', '18:00:00'),
(2, 'quinta', '10:00:00', '16:00:00');

ALTER TABLE pacientes ADD COLUMN nome VARCHAR(100);

INSERT INTO pacientes (id, usuario_id, email, telefone, cpf, data_nascimento)
SELECT id, id, email, telefone, 'valor_default', '2000-01-01' FROM usuarios WHERE id = 11;

SELECT c.data_consulta, c.horario_consulta, m.nome AS medico_nome, e.nome AS especialidade_nome
FROM consultas c
JOIN medicos m ON c.medico_id = m.id
JOIN especialidades e ON m.especialidade_id = e.id
WHERE c.paciente_id = 11;

SELECT id, senha FROM usuarios WHERE email = 'guilhermeurbano146@gmail.com';

SELECT m.id AS medico_id, u.nome AS medico_nome, e.nome AS especialidade_nome 
FROM medicos m
JOIN usuarios u ON m.usuario_id = u.id
JOIN especialidades e ON m.especialidade_id = e.id;

SELECT c.id, c.data_consulta, c.horario_consulta, p.nome AS paciente_nome, u.nome AS medico_nome, e.nome AS especialidade_nome
FROM consultas c
JOIN pacientes p ON c.paciente_id = p.id
JOIN medicos m ON c.medico_id = m.id
JOIN usuarios u ON m.usuario_id = u.id
JOIN especialidades e ON m.especialidade_id = e.id
WHERE c.paciente_id = 11;








