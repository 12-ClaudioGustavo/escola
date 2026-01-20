CREATE TABLE IF NOT EXISTS alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo VARCHAR(255) NOT NULL,
  classe VARCHAR(10) NOT NULL,
  turma VARCHAR(50),
  nome_pai VARCHAR(255),
  nome_mae VARCHAR(255),
  genero VARCHAR(1),
  naturalidade VARCHAR(255),
  municipio VARCHAR(255),
  provincia VARCHAR(255),
  nascimento TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS declaracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  tipo VARCHAR(255) NOT NULL,
  conteudo TEXT,
  status VARCHAR(50) DEFAULT 'emitida',
  data_emissao TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,

    lp INT NOT NULL,
    mat INT NOT NULL,
    estm INT,
    emp INT NOT NULL,
    em INT NOT NULL,
    edf INT NOT NULL,
    lk INT NOT NULL,
    cn INT,
    his INT,
    geo INT,
    emc INT
);
CREATE TABLE IF NOT EXISTS turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  classe VARCHAR(10) NOT NULL,
  ano_letivo INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela VARCHAR(100),
  operacao VARCHAR(20),
  aluno_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alunos_updated
BEFORE UPDATE ON alunos
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_declaracoes_updated
BEFORE UPDATE ON declaracoes
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_turmas_updated
BEFORE UPDATE ON turmas
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();


ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE declaracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Permitir leitura pública em alunos" ON alunos
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção autenticada em alunos" ON alunos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização autenticada em alunos" ON alunos
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão autenticada em alunos" ON alunos
  FOR DELETE USING (auth.role() = 'authenticated');


CREATE POLICY "Permitir leitura pública em declarações" ON declaracoes
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção autenticada em declarações" ON declaracoes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização autenticada em declarações" ON declaracoes
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão autenticada em declarações" ON declaracoes
  FOR DELETE USING (auth.role() = 'authenticated');


CREATE POLICY "Permitir leitura pública em turmas" ON turmas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção autenticada em turmas" ON turmas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização autenticada em turmas" ON turmas
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE alunos IS 'Tabela principal com dados dos alunos';
COMMENT ON TABLE declaracoes IS 'Tabela de declarações geradas';
COMMENT ON TABLE turmas IS 'Tabela de turmas/classes';
COMMENT ON TABLE logs IS 'Tabela de auditoria de operações';