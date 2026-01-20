// Controle de modais

// Modal Novo Aluno
const modalNovoAluno = document.getElementById('modalNovoAluno');
const btnNovoAluno = document.getElementById('btnNovoAluno');
const closeModalBtn = document.getElementById('closeModalBtn');
const btnCancelar = document.getElementById('btnCancelar');
const formNovoAluno = document.getElementById('formNovoAluno');

// Modal Visualizar Aluno
const modalAluno = document.getElementById('modalAluno');
const closeAlunoModal = document.getElementById('closeAlunoModal');

// Abrir modal novo aluno
btnNovoAluno.addEventListener('click', () => {
    formNovoAluno.reset();
    modalNovoAluno.classList.remove('hidden');
});

// Fechar modal novo aluno
closeModalBtn.addEventListener('click', () => {
    modalNovoAluno.classList.add('hidden');
});

btnCancelar.addEventListener('click', () => {
    modalNovoAluno.classList.add('hidden');
});

// Fechar modal aluno
closeAlunoModal.addEventListener('click', () => {
    modalAluno.classList.add('hidden');
});

// Fechar modais ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target === modalNovoAluno) {
        modalNovoAluno.classList.add('hidden');
    }
    if (e.target === modalAluno) {
        modalAluno.classList.add('hidden');
    }
});

// Enviar formulário novo aluno
formNovoAluno.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try { 
        const alunoData = {
            nome: document.getElementById('nome').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            classe: document.getElementById('classe').value
        };

        showStatus('Cadastrando aluno...', 'info');
        
        await supabaseDB.createAluno(alunoData);
        
        showStatus('Aluno cadastrado com sucesso!', 'success');
        modalNovoAluno.classList.add('hidden');
        formNovoAluno.reset();
        
        // Recarregar lista de alunos
        await loadAlunos();
        await updateFilters();
        await loadEstatisticas();
        
    } catch (error) {
        showStatus(`Erro: ${error.message}`, 'error');
    }
});

// Função para mostrar status
function showStatus(message, type = 'info') {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = `mb-6 p-4 rounded-lg text-white`;
    
    if (type === 'success') {
        statusMessage.classList.add('bg-green-500');
    } else if (type === 'error') {
        statusMessage.classList.add('bg-red-500');
    } else {
        statusMessage.classList.add('bg-blue-500');
    }
    
    statusMessage.classList.remove('hidden');
    
    // Remover mensagem após 4 segundos
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 4000);
}

// Função para abrir modal de detalhes do aluno
function openAlunoModal(aluno) {
    const content = document.getElementById('alunoDetailsContent');
    content.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-600 text-sm">Nome</p>
                    <p class="text-gray-900 font-semibold">${aluno.nome}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-600 text-sm">Data de Nascimento</p>
                    <p class="text-gray-900 font-semibold">${new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                    <p class="text-gray-600 text-sm">Email</p>
                    <p class="text-gray-900 font-semibold">${aluno.email || '-'}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-600 text-sm">Turma</p>
                    <p class="text-gray-900 font-semibold">${aluno.turma}</p>
                </div>
                <div>
                    <p class="text-gray-600 text-sm">Classe</p>
                    <p class="text-gray-900 font-semibold">${aluno.classe}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-600 text-sm">Responsável</p>
                    <p class="text-gray-900 font-semibold">${aluno.responsavel || '-'}</p>
                </div>
                <div>
                    <p class="text-gray-600 text-sm">Telefone</p>
                    <p class="text-gray-900 font-semibold">${aluno.telefone || '-'}</p>
                </div>
            </div>

            <div class="border-t border-gray-200 pt-4">
                <p class="text-gray-600 text-sm">Data de Cadastro</p>
                <p class="text-gray-900 font-semibold">${new Date(aluno.data_cadastro).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div class="border-t border-gray-200 pt-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Declarações</h3>
                <div id="declaracoesContainer" class="space-y-2">
                    Carregando...
                </div>
            </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-gray-200 mt-6">
            <button onclick="gerarDeclaracao('${aluno.id}', '${aluno.nome}')" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                + Gerar Declaração
            </button>
            <button onclick="editarAluno('${aluno.id}')" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                Editar
            </button>
            <button onclick="deletarAluno('${aluno.id}')" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                Deletar
            </button>
        </div>
    `;

    // Carregar declarações do aluno
    loadDeclaracoes(aluno.id);
    
    modalAluno.classList.remove('hidden');
}

// Carregar declarações do aluno
async function loadDeclaracoes(alunoId) {
    try {
        const declaracoes = await supabaseDB.getDeclaracoesByAluno(alunoId);
        const container = document.getElementById('declaracoesContainer');
        
        if (declaracoes.length === 0) {
            container.innerHTML = '<p class="text-gray-600">Nenhuma declaração emitida</p>';
            return;
        }

        container.innerHTML = declaracoes.map(dec => `
            <div class="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center">
                <div>
                    <p class="font-semibold text-gray-800">${dec.tipo}</p>
                    <p class="text-sm text-gray-600">${new Date(dec.data_emissao).toLocaleDateString('pt-BR')}</p>
                </div>
                <button onclick="deletarDeclaracao('${dec.id}')" class="text-red-600 hover:text-red-800 p-1">
                    ✕
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar declarações:', error);
    }
}

// Funções para editar e deletar
async function editarAluno(id) {
    // Implementar edição
    alert('Funcionalidade de edição em desenvolvimento');
}

async function deletarAluno(id) {
    if (confirm('Tem certeza que deseja deletar este aluno? Esta ação não pode ser desfeita.')) {
        try {
            showStatus('Deletando aluno...', 'info');
            await supabaseDB.deleteAluno(id);
            showStatus('Aluno deletado com sucesso!', 'success');
            modalAluno.classList.add('hidden');
            await loadAlunos();
            await updateFilters();
            await loadEstatisticas();
        } catch (error) {
            showStatus(`Erro: ${error.message}`, 'error');
        }
    }
}

async function deletarDeclaracao(id) {
    if (confirm('Tem certeza que deseja deletar esta declaração?')) {
        try {
            await supabaseDB.deleteDeclaracao(id);
            showStatus('Declaração deletada com sucesso!', 'success');
            // Recarregar a lista de declarações
            const alunoId = getCurrentAlunoId();
            if (alunoId) {
                await loadDeclaracoes(alunoId);
            }
        } catch (error) {
            showStatus(`Erro: ${error.message}`, 'error');
        }
    }
}

function getCurrentAlunoId() {
    // Função auxiliar para pegar o ID do aluno atualmente visualizado
    // Você pode armazenar isso em uma variável global quando abrir o modal
    return window.currentAlunoId || null;
}
