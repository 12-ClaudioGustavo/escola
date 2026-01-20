// Gerenciamento de Alunos

let alunosLocal = [];

/**
 * Adiciona um novo aluno (local ou via Supabase)
 */
async function adicionarAluno(dados) {
    try {
        // 🔎 Validações obrigatórias conforme o banco
        if (!dados.nome_completo || !dados.nome_completo.trim()) {
            mostrarMensagem('erro', 'Nome completo é obrigatório');
            return;
        }

        if (!dados.classe || !dados.classe.trim()) {
            mostrarMensagem('erro', 'Classe é obrigatória');
            return;
        }

        if (!supabaseClient) {
            mostrarMensagem('erro', 'Banco de dados não configurado.');
            return;
        }

        mostrarLoader(true);

        // 📦 Objeto exatamente igual ao schema do banco
        const alunoData = {
            nome_completo: dados.nome_completo.trim(),
            classe: dados.classe.trim(),
            turma: dados.turma || null,
            nome_pai: dados.nome_pai || null,
            nome_mae: dados.nome_mae || null,
            genero: dados.genero || null, // VARCHAR(1): 'M' ou 'F'
            naturalidade: dados.naturalidade || null,
            municipio: dados.municipio || null,
            provincia: dados.provincia || null,
            nascimento: dados.nascimento || null
        };

        let aluno;

        if (dados.id) {
            // ✏️ Atualizar aluno
            aluno = await supabaseDB.updateAluno(dados.id, alunoData);
            
            // Salvar notas se fornecidas
            if (dados.notas && Object.keys(dados.notas).length > 0) {
                const notasData = converterDisciplinasParaNotas(dados.notas, aluno.classe);
                await supabaseDB.createOrUpdateNotas(dados.id, notasData);
            }
            
            notificacao(
                'success',
                'Sucesso!',
                `${aluno.nome_completo} atualizado com sucesso!`,
                2000
            );
        } else {
            // ➕ Criar aluno
            aluno = await supabaseDB.createAluno(alunoData);
            
            // Salvar notas se fornecidas
            if (dados.notas && Object.keys(dados.notas).length > 0) {
                const notasData = converterDisciplinasParaNotas(dados.notas, aluno.classe);
                await supabaseDB.createOrUpdateNotas(aluno.id, notasData);
            }
            
            notificacao(
                'success',
                'Aluno Adicionado!',
                `${aluno.nome_completo} foi cadastrado com sucesso!`,
                2000
            );
        }

        setTimeout(() => {
            closeModal();
            carregarAlunos();
        }, 2100);

    } catch (erro) {
        console.error('Erro ao salvar aluno:', erro);
        mostrarMensagem('erro', erro.message || 'Erro ao salvar aluno');
    } finally {
        mostrarLoader(false);
    }
}

/**
 * Carrega alunos do Supabase
 */
async function carregarAlunos() {
    try {
        if (!supabaseClient) {
            mostrarMensagem('erro', 'Banco de dados não configurado!');
            console.warn('Verifique suas credenciais em js/config.js');
            return [];
        }
        mostrarLoader(true);
        const dados = await supabaseDB.getAlunos();
        alunosLocal = dados || [];
        renderizarTurmas(alunosLocal);
        return alunosLocal;
    } catch (erro) {
        console.error('Erro ao carregar alunos:', erro);
        mostrarMensagem('erro', 'Não foi possível carregar os alunos do banco de dados.');
        alunosLocal = [];
        return [];
    } finally {
        mostrarLoader(false);
    }
}

/**
 * Deleta um aluno
 */
async function deletarAluno(id) {
    try {
        if (!supabaseClient) {
            mostrarMensagem('erro', 'Banco de dados não configurado.');
            return;
        }

        const aluno = alunosLocal.find(a => a.id === id);
        if (!aluno) {
            mostrarMensagem('erro', 'Aluno não encontrado');
            return;
        }
        
        mostrarLoader(true);
        await supabaseDB.deleteAluno(id);
        notificacao('success', 'Deletado!', `${aluno.nome_completo} foi deletado com sucesso`, 2000);
        carregarAlunos(); // Recarrega do banco de dados
    } catch (erro) {
        console.error('Erro ao deletar aluno:', erro);
        mostrarMensagem('erro', 'Erro ao deletar aluno');
    } finally {
        mostrarLoader(false);
    }
}



/**
 * Obtém alunos de uma turma/classe específica
 */
function getAlunosPorClasse(classe, turma) {
    return alunosLocal.filter(a => a.classe === classe && a.turma === turma);
}

/**
 * Obtém um aluno pelo ID
 */
function getAlunoPorId(id) {
    return alunosLocal.find(a => a.id === id);
}

// Event listener para o formulário de cadastro
document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();

            const dados = {
                nome_completo: document.getElementById('nomeCompleto').value.trim(),
                classe: document.getElementById('classe').value,
                turma: document.getElementById('turma').value || null,
                genero: document.getElementById('genero').value,
                nome_pai: document.getElementById('nomePai').value || null,
                nome_mae: document.getElementById('nomeMae').value || null,
                naturalidade: document.getElementById('naturalidade').value || null,
                municipio: document.getElementById('municipio').value || null,
                provincia: document.getElementById('provincia').value || null,
                nascimento: document.getElementById('dataNascimento').value
                    ? new Date(document.getElementById('dataNascimento').value)
                    : null
            };

            // 🔎 Validações básicas (alinhadas ao banco)
            if (!dados.nome_completo) {
                mostrarMensagem('erro', 'Nome completo é obrigatório.');
                return;
            }

            if (!dados.classe) {
                mostrarMensagem('erro', 'Classe é obrigatória.');
                return;
            }

            // Converter genero de "Masculino"/"Feminino" para 'M'/'F'
            if (dados.genero) {
                if (dados.genero === 'Masculino') {
                    dados.genero = 'M';
                } else if (dados.genero === 'Feminino') {
                    dados.genero = 'F';
                }
            }

            // Coletar notas do formulário
            const notas = {};
            const classe = dados.classe;
            const disciplinas = DISCIPLINAS[classe] || [];
            
            disciplinas.forEach(disciplina => {
                const id = 'nota_' + disciplina.toLowerCase().replace(/[\s.]/g, '_');
                const input = document.getElementById(id);
                if (input && input.value) {
                    const nota = parseFloat(input.value);
                    if (!isNaN(nota) && nota >= 0 && nota <= 10) {
                        notas[disciplina] = nota;
                    }
                }
            });
            
            dados.notas = notas;

            // ✏️ Modo edição
            if (alunoEmEdicao) {
                dados.id = alunoEmEdicao.id;
            }

            adicionarAluno(dados);
        });
    }

    carregarAlunos();
});

