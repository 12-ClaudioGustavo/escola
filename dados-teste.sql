-- Script SQL para inserir dados de teste no Supabase
-- Execute isto no SQL Editor do Supabase

-- Inserir alunos de teste
INSERT INTO alunos (matricula, nome, data_nascimento, email, turma, classe, responsavel, telefone) VALUES
('2024001', 'Ana Silva Santos', '2008-03-15', 'ana.silva@email.com', 'Manhã', '1º Ano A', 'Maria Santos', '(11) 98765-4321'),
('2024002', 'Bruno Costa Oliveira', '2008-05-22', 'bruno.costa@email.com', 'Manhã', '1º Ano A', 'João Oliveira', '(11) 97654-3210'),
('2024003', 'Carolina Mendes Rocha', '2008-07-10', 'carolina.mendes@email.com', 'Manhã', '1º Ano B', 'Patricia Rocha', '(11) 96543-2109'),
('2024004', 'Daniel Ferreira Gomes', '2008-09-18', 'daniel.ferreira@email.com', 'Tarde', '2º Ano A', 'Roberto Gomes', '(11) 95432-1098'),
('2024005', 'Eduarda Pereira Lima', '2007-11-25', 'eduarda.pereira@email.com', 'Tarde', '2º Ano A', 'Fátima Lima', '(11) 94321-0987'),
('2024006', 'Felipe Alves Martins', '2007-01-08', 'felipe.alves@email.com', 'Tarde', '2º Ano B', 'Carlos Martins', '(11) 93210-9876'),
('2024007', 'Gabriela Silva Castro', '2006-03-12', 'gabriela.silva@email.com', 'Noite', '3º Ano A', 'Lucia Castro', '(11) 92109-8765'),
('2024008', 'Henrique Costa Barbosa', '2006-05-20', 'henrique.costa@email.com', 'Noite', '3º Ano A', 'Antonio Barbosa', '(11) 91098-7654'),
('2024009', 'Isabela Gomes Dias', '2008-06-14', 'isabela.gomes@email.com', 'Manhã', '1º Ano C', 'Vicente Dias', '(11) 90987-6543'),
('2024010', 'João Paulo Silva Souza', '2008-08-30', 'joao.paulo@email.com', 'Tarde', '2º Ano C', 'Marisa Souza', '(11) 99876-5432');

-- Inserir algumas declarações de teste
INSERT INTO declaracoes (aluno_id, tipo, conteudo, status) 
SELECT id, 'Declaração de Frequência', 'Aluno apresenta frequência regular às aulas', 'emitida' 
FROM alunos 
WHERE matricula = '2024001';

INSERT INTO declaracoes (aluno_id, tipo, conteudo, status) 
SELECT id, 'Declaração de Boa Conduta', 'Aluno possui excelente comportamento', 'emitida' 
FROM alunos 
WHERE matricula = '2024002';

INSERT INTO declaracoes (aluno_id, tipo, conteudo, status) 
SELECT id, 'Declaração de Vínculo Escolar', 'Comprovante de matrícula válida', 'emitida' 
FROM alunos 
WHERE matricula = '2024003';
