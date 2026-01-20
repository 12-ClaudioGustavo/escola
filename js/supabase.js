// Inicializar Cliente Supabase
// Aguarda o Supabase estar disponível
let supabaseClient = null;
let isAuthenticated = false;

function inicializarSupabase() {
    try {
        if (typeof window.supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_KEY !== 'undefined') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('✓ Supabase inicializado com sucesso');
            // Tentar autenticação automática se necessário
            verificarEAutenticar();
        } else {
            console.warn('⚠ Supabase CDN ou credenciais não disponíveis, usando localStorage');
        }
    } catch (e) {
        console.error('✗ Erro ao inicializar Supabase:', e.message);
    }
}

/**
 * Verifica e autentica automaticamente se necessário
 * Nota: Se as políticas RLS requerem autenticação, você precisa:
 * 1. Criar um usuário no Supabase Auth
 * 2. Ou executar o script UPDATE_RLS_POLICIES.sql para permitir operações públicas
 */
async function verificarEAutenticar() {
    if (!supabaseClient) return;
    
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error || !user) {
            // Se não estiver autenticado, tentar fazer sign in anônimo (se habilitado)
            // OU você pode criar um usuário padrão e fazer sign in aqui
            console.warn('⚠ Usuário não autenticado. Se as políticas RLS requerem autenticação, você precisa autenticar.');
            console.warn('⚠ Alternativa: Execute o script UPDATE_RLS_POLICIES.sql no Supabase para permitir operações públicas.');
            isAuthenticated = false;
        } else {
            console.log('✓ Usuário autenticado:', user.email || user.id);
            isAuthenticated = true;
        }
    } catch (e) {
        console.warn('⚠ Erro ao verificar autenticação:', e.message);
        isAuthenticated = false;
    }
}

// Tentar inicializar assim que o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSupabase);
} else {
    inicializarSupabase();
}

// Funções auxiliares para conversão de notas
// Mapeamento de campos da tabela para nomes de disciplinas
const MAPEAMENTO_NOTAS = {
    'lp': 'Língua Portuguesa',
    'mat': 'Matemática',
    'estm': 'Estudo do Meio',
    'emp': 'Educação M. e Plástica',
    'em': 'Educação Músical',
    'edf': 'Educação Física',
    'lk': 'Lingua Kikongo',
    'cn': 'Ciências da Natureza',
    'his': 'História',
    'geo': 'Geografia',
    'emc': 'Educação M. e Cívica'
};

// Mapeamento inverso: disciplinas para campos da tabela
const MAPEAMENTO_DISCIPLINAS = {};
Object.entries(MAPEAMENTO_NOTAS).forEach(([campo, disciplina]) => {
    MAPEAMENTO_DISCIPLINAS[disciplina] = campo;
});

/**
 * Converte notas da tabela (lp, mat, etc) para formato de disciplinas
 */
function converterNotasParaDisciplinas(notasObj, classe) {
    if (!notasObj) return {};
    
    const disciplinas = DISCIPLINAS[classe] || [];
    const resultado = {};
    
    disciplinas.forEach(disciplina => {
        const campo = MAPEAMENTO_DISCIPLINAS[disciplina];
        if (campo && notasObj[campo] !== null && notasObj[campo] !== undefined) {
            // Converter de inteiro (x10) para decimal se necessário
            const nota = notasObj[campo];
            resultado[disciplina] = typeof nota === 'number' && nota > 10 ? nota / 10 : nota;
        }
    });
    
    return resultado;
}

/**
 * Converte notas de disciplinas para formato da tabela (lp, mat, etc)
 */
function converterDisciplinasParaNotas(disciplinasObj, classe) {
    if (!disciplinasObj) return {};
    
    const resultado = {};
    
    Object.entries(disciplinasObj).forEach(([disciplina, nota]) => {
        const campo = MAPEAMENTO_DISCIPLINAS[disciplina];
        if (campo && nota !== null && nota !== undefined && nota !== '') {
            // Converter para inteiro conforme schema (INT) - multiplicar por 10 para preservar 1 decimal
            const notaFloat = parseFloat(nota);
            if (!isNaN(notaFloat)) {
                resultado[campo] = Math.round(notaFloat * 10);
            }
        }
    });
    
    return resultado;
}

// Funções auxiliares do Supabase
const supabaseDB = {
    // Verificar autenticação
    async checkAuth() {
        if (!supabaseClient) throw new Error('Supabase não inicializado');
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        return user;
    },

    // ===== ALUNOS =====
    async getAlunos() {
        const { data, error } = await supabaseClient
            .from('alunos')
            .select(`
                *,
                notas (*)
            `)
            .order('nome_completo', { ascending: true });
        
        if (error) throw new Error(`Erro ao buscar alunos: ${error.message}`);
        
        // Transformar notas para o formato esperado pelo código
        return (data || []).map(aluno => {
            if (aluno.notas && aluno.notas.length > 0) {
                const notasObj = aluno.notas[0];
                // Converter campos da tabela notas para formato de disciplinas
                aluno.notas = converterNotasParaDisciplinas(notasObj, aluno.classe);
            } else {
                aluno.notas = {};
            }
            return aluno;
        });
    },

    async getAlunoById(id) {
        const { data, error } = await supabaseClient
            .from('alunos')
            .select(`
                *,
                notas (*)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw new Error(`Erro ao buscar aluno: ${error.message}`);
        
        // Transformar notas para o formato esperado pelo código
        if (data.notas && data.notas.length > 0) {
            const notasObj = data.notas[0];
            data.notas = converterNotasParaDisciplinas(notasObj, data.classe);
        } else {
            data.notas = {};
        }
        
        return data;
    },

    async createAluno(alunoData) {
        const { data, error } = await supabaseClient
            .from('alunos')
            .insert([{
                nome_completo: alunoData.nome_completo,
                classe: alunoData.classe,
                turma: alunoData.turma || null,
                nome_pai: alunoData.nome_pai || null,
                nome_mae: alunoData.nome_mae || null,
                genero: alunoData.genero || null,
                naturalidade: alunoData.naturalidade || null,
                municipio: alunoData.municipio || null,
                provincia: alunoData.provincia || null,
                nascimento: alunoData.nascimento || null
            }])
            .select();
        
        if (error) throw new Error(`Erro ao criar aluno: ${error.message}`);
        return data[0];
    },

    async updateAluno(id, alunoData) {
        const { data, error } = await supabaseClient
            .from('alunos')
            .update({
                nome_completo: alunoData.nome_completo,
                classe: alunoData.classe,
                turma: alunoData.turma || null,
                nome_pai: alunoData.nome_pai || null,
                nome_mae: alunoData.nome_mae || null,
                genero: alunoData.genero || null,
                naturalidade: alunoData.naturalidade || null,
                municipio: alunoData.municipio || null,
                provincia: alunoData.provincia || null,
                nascimento: alunoData.nascimento || null
            })
            .eq('id', id)
            .select();
        
        if (error) throw new Error(`Erro ao atualizar aluno: ${error.message}`);
        return data[0];
    },

    async deleteAluno(id) {
        const { error } = await supabaseClient
            .from('alunos')
            .delete()
            .eq('id', id);
        
        if (error) throw new Error(`Erro ao deletar aluno: ${error.message}`);
        return true;
    },

    async getAlunosByTurma(turma) {
        const { data, error } = await supabaseClient
            .from('alunos')
            .select('*')
            .eq('turma', turma)
            .order('nome_completo', { ascending: true });
        
        if (error) throw new Error(`Erro ao buscar alunos por turma: ${error.message}`);
        return data || [];
    },

    async getAlunosByClasse(classe) {
        const { data, error } = await supabaseClient
            .from('alunos')
            .select('*')
            .eq('classe', classe)
            .order('nome_completo', { ascending: true });
        
        if (error) throw new Error(`Erro ao buscar alunos por classe: ${error.message}`);
        return data || [];
    },

    // ===== NOTAS =====
    async getNotasByAluno(alunoId) {
        const { data, error } = await supabaseClient
            .from('notas')
            .select('*')
            .eq('aluno_id', alunoId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw new Error(`Erro ao buscar notas: ${error.message}`);
        return data || null;
    },

    async createOrUpdateNotas(alunoId, notasData) {
        // Verificar se já existe nota para este aluno
        const { data: existing } = await supabaseClient
            .from('notas')
            .select('id')
            .eq('aluno_id', alunoId)
            .single();
        
        if (existing) {
            // Atualizar
            const { data, error } = await supabaseClient
                .from('notas')
                .update(notasData)
                .eq('aluno_id', alunoId)
                .select();
            
            if (error) throw new Error(`Erro ao atualizar notas: ${error.message}`);
            return data[0];
        } else {
            // Criar
            const { data, error } = await supabaseClient
                .from('notas')
                .insert([{
                    aluno_id: alunoId,
                    ...notasData
                }])
                .select();
            
            if (error) throw new Error(`Erro ao criar notas: ${error.message}`);
            return data[0];
        }
    },

    async deleteNotas(alunoId) {
        const { error } = await supabaseClient
            .from('notas')
            .delete()
            .eq('aluno_id', alunoId);
        
        if (error) throw new Error(`Erro ao deletar notas: ${error.message}`);
        return true;
    },

    // ===== DECLARAÇÕES =====
    async createDeclaracao(declaracaoData) {
        const { data, error } = await supabaseClient
            .from('declaracoes')
            .insert([{
                aluno_id: declaracaoData.alunoId,
                tipo: declaracaoData.tipo,
                data_emissao: new Date().toISOString(),
                conteudo: declaracaoData.conteudo,
                status: 'emitida'
            }])
            .select();
        
        if (error) throw new Error(`Erro ao criar declaração: ${error.message}`);
        return data[0];
    },

    async getDeclaracoesByAluno(alunoId) {
        const { data, error } = await supabaseClient
            .from('declaracoes')
            .select('*')
            .eq('aluno_id', alunoId)
            .order('data_emissao', { ascending: false });
        
        if (error) throw new Error(`Erro ao buscar declarações: ${error.message}`);
        return data || [];
    },

    async deleteDeclaracao(id) {
        const { error } = await supabaseClient
            .from('declaracoes')
            .delete()
            .eq('id', id);
        
        if (error) throw new Error(`Erro ao deletar declaração: ${error.message}`);
        return true;
    },

    // ===== ESTATÍSTICAS =====
    async getEstatisticas() {
        try {
            // Total de alunos
            const { count: totalAlunos } = await supabaseClient
                .from('alunos')
                .select('*', { count: 'exact', head: true });

            // Total de turmas únicas
            const { data: turmas } = await supabaseClient
                .from('alunos')
                .select('turma')
                .order('turma', { ascending: true });
            const tumasUnicas = new Set(turmas?.map(a => a.turma) || []).size;

            // Total de classes únicas
            const { data: classes } = await supabaseClient
                .from('alunos')
                .select('classe')
                .order('classe', { ascending: true });
            const classesUnicas = new Set(classes?.map(a => a.classe) || []).size;

            // Total de declarações
            const { count: totalDeclaracoes } = await supabaseClient
                .from('declaracoes')
                .select('*', { count: 'exact', head: true });

            return {
                totalAlunos: totalAlunos || 0,
                totalTurmas: tumasUnicas,
                totalClasses: classesUnicas,
                totalDeclaracoes: totalDeclaracoes || 0
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return {
                totalAlunos: 0,
                totalTurmas: 0,
                totalClasses: 0,
                totalDeclaracoes: 0
            };
        }
    },

    // ===== FILTROS =====
    async getTurmas() {
        const { data, error } = await supabaseClient
            .from('alunos')
            .select('turma')
            .order('turma', { ascending: true });
        
        if (error) return [];
        
        // Retornar turmas únicas
        const turmas = [...new Set(data?.map(a => a.turma) || [])];
        return turmas;
    },

    async getClasses() {
        const { data, error } = await supabaseClient
            .from('alunos')
            .select('classe')
            .order('classe', { ascending: true });
        
        if (error) return [];
        
        // Retornar classes únicas
        const classes = [...new Set(data?.map(a => a.classe) || [])];
        return classes;
    }
};
