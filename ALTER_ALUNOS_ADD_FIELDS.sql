
-- 1. Adicionar coluna genero
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS ;

-- 2. Adicionar coluna naturalidade
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS ;

-- 3. Adicionar coluna municipio
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS ;

-- 4. Adicionar coluna provincia
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS ;

-- ============================================================================
-- ÍNDICES (Opcional - para melhor performance)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_alunos_genero ON alunos(genero);
CREATE INDEX IF NOT EXISTS idx_alunos_naturalidade ON alunos(naturalidade);
CREATE INDEX IF NOT EXISTS idx_alunos_municipio ON alunos(municipio);
CREATE INDEX IF NOT EXISTS idx_alunos_provincia ON alunos(provincia);

