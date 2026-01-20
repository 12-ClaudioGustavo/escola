-- Atualizar políticas RLS para permitir operações públicas
-- Execute este script no Supabase SQL Editor

-- Remover políticas antigas que requerem autenticação
DROP POLICY IF EXISTS "Permitir inserção autenticada em alunos" ON alunos;
DROP POLICY IF EXISTS "Permitir atualização autenticada em alunos" ON alunos;
DROP POLICY IF EXISTS "Permitir exclusão autenticada em alunos" ON alunos;

DROP POLICY IF EXISTS "Permitir inserção autenticada em declarações" ON declaracoes;
DROP POLICY IF EXISTS "Permitir atualização autenticada em declarações" ON declaracoes;
DROP POLICY IF EXISTS "Permitir exclusão autenticada em declarações" ON declaracoes;

DROP POLICY IF EXISTS "Permitir inserção autenticada em turmas" ON turmas;
DROP POLICY IF EXISTS "Permitir atualização autenticada em turmas" ON turmas;

-- Criar novas políticas que permitem operações públicas
CREATE POLICY "Permitir inserção pública em alunos" ON alunos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública em alunos" ON alunos
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública em alunos" ON alunos
  FOR DELETE USING (true);

CREATE POLICY "Permitir inserção pública em declarações" ON declaracoes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública em declarações" ON declaracoes
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública em declarações" ON declaracoes
  FOR DELETE USING (true);

CREATE POLICY "Permitir inserção pública em turmas" ON turmas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública em turmas" ON turmas
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Habilitar RLS na tabela notas (se ainda não estiver habilitado)
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela notas
DROP POLICY IF EXISTS "Permitir inserção autenticada em notas" ON notas;
DROP POLICY IF EXISTS "Permitir atualização autenticada em notas" ON notas;
DROP POLICY IF EXISTS "Permitir exclusão autenticada em notas" ON notas;
DROP POLICY IF EXISTS "Permitir leitura autenticada em notas" ON notas;
DROP POLICY IF EXISTS "Permitir leitura pública em notas" ON notas;
DROP POLICY IF EXISTS "Permitir inserção pública em notas" ON notas;
DROP POLICY IF EXISTS "Permitir atualização pública em notas" ON notas;
DROP POLICY IF EXISTS "Permitir exclusão pública em notas" ON notas;

CREATE POLICY "Permitir leitura pública em notas" ON notas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública em notas" ON notas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública em notas" ON notas
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública em notas" ON notas
  FOR DELETE USING (true);
