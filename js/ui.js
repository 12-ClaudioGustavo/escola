// Gerenciamento de UI (Interface do Usuário)

// Variável global para rastrear se está editando
let alunoEmEdicao = null;

function openModal() {
    alunoEmEdicao = null;
    const modal = document.getElementById('modalCadastro');
    const titulo = modal.querySelector('h2');
    const btnSalvar = document.getElementById('btnSalvar');
    
    titulo.textContent = '➕ Cadastrar Novo Aluno';
    btnSalvar.textContent = '💾 Salvar Aluno';
    btnSalvar.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    btnSalvar.classList.add('bg-green-600', 'hover:bg-green-700');
    
    modal.classList.remove('hidden');
    document.getElementById('notasContainer').innerHTML = '<p class="text-gray-500">Selecione uma classe para ver as notas</p>';
    document.getElementById('classe').value = '';
    document.getElementById('formCadastro').reset();
}

/**
 * Abre o modal para editar um aluno existente
 */
function editarAluno(alunoId) {
    // alunosLocal é a fonte de verdade agora, carregada do Supabase
    const aluno = alunosLocal.find(a => a.id === alunoId);
    
    if (!aluno) {
        mostrarMensagem('erro', 'Aluno não encontrado');
        return;
    }
    
    alunoEmEdicao = aluno;
    const modal = document.getElementById('modalCadastro');
    const titulo = modal.querySelector('h2');
    const btnSalvar = document.getElementById('btnSalvar');
    
    titulo.textContent = `✏️ Editar: ${aluno.nome_completo}`;
    btnSalvar.textContent = '💾 Atualizar Aluno';
    btnSalvar.classList.remove('bg-green-600', 'hover:bg-green-700');
    btnSalvar.classList.add('bg-blue-600', 'hover:bg-blue-700');
    
    // Preencher formulário com dados existentes
    document.getElementById('nomeCompleto').value = aluno.nome_completo || '';
    document.getElementById('classe').value = aluno.classe || '';
    document.getElementById('turma').value = aluno.turma || '';
    document.getElementById('nomePai').value = aluno.nome_pai || '';
    document.getElementById('nomeMae').value = aluno.nome_mae || '';
    document.getElementById('naturalidade').value = aluno.naturalidade || '';
    document.getElementById('municipio').value = aluno.municipio || '';
    document.getElementById('provincia').value = aluno.provincia || '';
    
    // Converter genero de 'M'/'F' para "Masculino"/"Feminino" para o select
    if (aluno.genero === 'M') {
        document.getElementById('genero').value = 'Masculino';
    } else if (aluno.genero === 'F') {
        document.getElementById('genero').value = 'Feminino';
    } else {
        document.getElementById('genero').value = '';
    }
    
    // Preencher data de nascimento
    if (aluno.nascimento) {
        const data = new Date(aluno.nascimento);
        const dataFormatada = data.toISOString().split('T')[0];
        document.getElementById('dataNascimento').value = dataFormatada;
    }
    
    // Atualizar campos de notas
    atualizarCamposNotas();
    
    // Preencher notas se existirem (aguardar um pouco para garantir que os campos foram criados)
    setTimeout(() => {
        if (aluno.notas && typeof aluno.notas === 'object') {
            Object.entries(aluno.notas).forEach(([disciplina, nota]) => {
                const id = 'nota_' + disciplina.toLowerCase().replace(/[\s.]/g, '_');
                const input = document.getElementById(id);
                if (input && nota !== null && nota !== undefined) {
                    // Converter de inteiro (x10) para decimal se necessário
                    const notaDecimal = typeof nota === 'number' ? (nota % 10 === 0 ? nota / 10 : nota) : nota;
                    input.value = notaDecimal;
                }
            });
        }
    }, 100);
    
    modal.classList.remove('hidden');
    console.log('✏️ Editando aluno:', aluno);
}

/**
 * Confirma exclusão do aluno
 */
function deletarAlunoConfirm(alunoId) {
    if (confirm('Tem certeza que deseja deletar este aluno?')) {
        deletarAluno(alunoId);
    }
}

/**
 * Abre modal para gerar declaração
 * @param {string} alunoId - ID do aluno pré-selecionado (opcional)
 * @param {string} turma - Turma pré-selecionada (opcional)
 * @param {string} classe - Classe para filtrar alunos (opcional)
 */
function abrirModalGerarDeclaracao(alunoId = null, turma = null, classe = null) {
    openModalDeclaracao(alunoId, turma, classe);
}

/**
 * Fecha o modal de cadastro
 */
function closeModal() {
    const modal = document.getElementById('modalCadastro');
    modal.classList.add('hidden');
    document.getElementById('formCadastro').reset();
}

/**
 * Abre o modal de gerar declaração
 * @param {string} alunoId - ID do aluno pré-selecionado (opcional)
 * @param {string} turma - Turma pré-selecionada (opcional)
 * @param {string} classe - Classe para filtrar alunos (opcional)
 */
async function openModalDeclaracao(alunoId = null, turma = null, classe = null) {
    const modal = document.getElementById('modalDeclaracao');
    modal.classList.remove('hidden');
    
    // Pré-preencher ano letivo com ano atual/ano seguinte
    const anoAtual = new Date().getFullYear();
    const anoSeguinte = anoAtual + 1;
    document.getElementById('anoLetivoDeclaracao').value = `${anoAtual}/${anoSeguinte}`;
    
    await preencherSelectAlunos(classe, alunoId);
}

/**
 * Fecha o modal de gerar declaração
 */
function closeModalDeclaracao() {
    const modal = document.getElementById('modalDeclaracao');
    modal.classList.add('hidden');
    document.getElementById('formDeclaracao').reset();
    window.alunosSelecionadosParaDeclaracao = [];
    
    // Resetar visual
    const alunosSelecionadosDiv = document.getElementById('alunosSelecionados');
    if (alunosSelecionadosDiv) {
        alunosSelecionadosDiv.innerHTML = '<p class="text-sm text-gray-500">Nenhum aluno selecionado</p>';
    }
    
    const btnGerar = document.getElementById('btnGerarDeclaracao');
    if (btnGerar) {
        btnGerar.textContent = '📄 Gerar Declaração';
        btnGerar.disabled = true;
        btnGerar.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    // Limpar checkboxes
    const listaAlunos = document.getElementById('listaAlunos');
    if (listaAlunos) {
        listaAlunos.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    }
}

/**
 * Preenche a lista de alunos e implementa busca com seleção visual
 * @param {string} classeFiltro - Classe para filtrar alunos (opcional)
 * @param {string} alunoPreSelecionado - ID do aluno para pré-selecionar (opcional)
 */
async function preencherSelectAlunos(classeFiltro = null, alunoPreSelecionado = null) {
    const alunos = await carregarAlunos();
    let alunosArray = Array.isArray(alunos) ? alunos : [];
    
    // Filtrar por classe se fornecido
    if (classeFiltro) {
        alunosArray = alunosArray.filter(a => a.classe === classeFiltro);
    }
    
    const inputBusca = document.getElementById('buscarAluno');
    const listaDiv = document.getElementById('listaAlunos');
    const inputHidden = document.getElementById('selecionarAluno');
    const alunosSelecionadosDiv = document.getElementById('alunosSelecionados');
    
    // Limpar input de busca
    inputBusca.value = '';
    
    // Limpar seleção múltipla
    window.alunosSelecionadosParaDeclaracao = alunoPreSelecionado ? [alunoPreSelecionado] : [];
    
    // Renderizar lista completa inicialmente
    renderizarListaAlunos(alunosArray, listaDiv, inputHidden, alunoPreSelecionado);
    
    // Remover listeners antigos e adicionar novo
    const novoInputBusca = inputBusca.cloneNode(true);
    inputBusca.parentNode.replaceChild(novoInputBusca, inputBusca);
    
    novoInputBusca.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const alunosFiltrados = alunosArray.filter(aluno => 
            aluno.nome_completo.toLowerCase().includes(termo) ||
            (aluno.classe && aluno.classe.toString().includes(termo)) ||
            (aluno.turma && aluno.turma.toLowerCase().includes(termo))
        );
        renderizarListaAlunos(alunosFiltrados, listaDiv, inputHidden, null);
    });
}

// Variável global para armazenar alunos selecionados para declaração múltipla
window.alunosSelecionadosParaDeclaracao = [];

/**
 * Renderiza a lista de alunos para seleção com visual de tarefa marcada
 * Suporta seleção múltipla
 */
function renderizarListaAlunos(alunos, container, inputHidden, alunoPreSelecionado = null) {
    container.innerHTML = '';
    
    if (alunos.length === 0) {
        container.innerHTML = '<div class="p-4 text-gray-500 text-center">Nenhum aluno encontrado</div>';
        atualizarListaAlunosSelecionados();
        return;
    }
    
    // Se há aluno pré-selecionado, adicionar à lista
    if (alunoPreSelecionado && !window.alunosSelecionadosParaDeclaracao.includes(alunoPreSelecionado)) {
        window.alunosSelecionadosParaDeclaracao = [alunoPreSelecionado];
        inputHidden.value = alunoPreSelecionado;
    }
    
    alunos.forEach(aluno => {
        const div = document.createElement('div');
        const isSelected = window.alunosSelecionadosParaDeclaracao.includes(aluno.id);
        
        div.className = `p-3 border-b border-gray-200 cursor-pointer transition ${
            isSelected 
                ? 'bg-blue-100 border-l-4 border-l-blue-600' 
                : 'hover:bg-gray-50'
        }`;
        
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" ${isSelected ? 'checked' : ''} 
                       class="w-5 h-5 rounded cursor-pointer" 
                       onclick="event.stopPropagation(); toggleSelecaoAluno('${aluno.id}', this)"
                       data-aluno-id="${aluno.id}">
                <div class="flex-1">
                    <p class="font-semibold text-gray-800">${aluno.nome_completo}</p>
                    <p class="text-sm text-gray-600">${aluno.classe}ª Classe${aluno.turma ? ' - ' + aluno.turma : ''}</p>
                </div>
            </div>
        `;
        
        div.addEventListener('click', (e) => {
            // Não fazer nada se clicou no checkbox (já foi tratado)
            if (e.target.type === 'checkbox') return;
            
            // Toggle seleção
            const checkbox = div.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            toggleSelecaoAluno(aluno.id, checkbox);
        });
        
        container.appendChild(div);
    });
    
    atualizarListaAlunosSelecionados();
}

/**
 * Toggle seleção de aluno para declaração múltipla
 */
function toggleSelecaoAluno(alunoId, checkbox) {
    const index = window.alunosSelecionadosParaDeclaracao.indexOf(alunoId);
    const inputHidden = document.getElementById('selecionarAluno');
    
    if (checkbox.checked) {
        if (index === -1) {
            window.alunosSelecionadosParaDeclaracao.push(alunoId);
        }
    } else {
        if (index > -1) {
            window.alunosSelecionadosParaDeclaracao.splice(index, 1);
        }
    }
    
    // Atualizar input hidden com primeiro selecionado (para compatibilidade)
    if (window.alunosSelecionadosParaDeclaracao.length > 0) {
        inputHidden.value = window.alunosSelecionadosParaDeclaracao[0];
    } else {
        inputHidden.value = '';
    }
    
    atualizarListaAlunosSelecionados();
    
    // Atualizar visual do item
    const div = checkbox.closest('div[class*="p-3"]');
    if (checkbox.checked) {
        div.classList.add('bg-blue-100', 'border-l-4', 'border-l-blue-600');
        div.classList.remove('hover:bg-gray-50');
    } else {
        div.classList.remove('bg-blue-100', 'border-l-4', 'border-l-blue-600');
        div.classList.add('hover:bg-gray-50');
    }
}

/**
 * Atualiza a lista visual de alunos selecionados
 */
function atualizarListaAlunosSelecionados() {
    const container = document.getElementById('alunosSelecionados');
    const btnGerar = document.getElementById('btnGerarDeclaracao');
    
    if (!container) return;
    
    const count = window.alunosSelecionadosParaDeclaracao.length;
    
    if (count === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500">Nenhum aluno selecionado</p>';
        if (btnGerar) {
            btnGerar.textContent = '📄 Gerar Declaração';
            btnGerar.disabled = true;
            btnGerar.classList.add('opacity-50', 'cursor-not-allowed');
        }
        return;
    }
    
    const alunos = alunosLocal.filter(a => window.alunosSelecionadosParaDeclaracao.includes(a.id));
    
    let html = `<div class="space-y-2">`;
    html += `<p class="text-sm font-semibold text-gray-700 mb-2">
        <span class="bg-blue-600 text-white px-2 py-1 rounded-full text-xs mr-2">${count}</span>
        ${count === 1 ? 'aluno selecionado' : 'alunos selecionados'}:
    </p>`;
    
    alunos.forEach(aluno => {
        html += `
            <div class="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                <div class="flex-1">
                    <span class="text-sm font-medium text-gray-800">${aluno.nome_completo}</span>
                    <span class="text-xs text-gray-600 ml-2">${aluno.classe}ª Classe${aluno.turma ? ' - ' + aluno.turma : ''}</span>
                </div>
                <button onclick="removerAlunoSelecionado('${aluno.id}')" 
                        class="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded text-sm font-bold ml-2" 
                        title="Remover">✕</button>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
    
    // Atualizar botão
    if (btnGerar) {
        btnGerar.disabled = false;
        btnGerar.classList.remove('opacity-50', 'cursor-not-allowed');
        if (count === 1) {
            btnGerar.textContent = '📄 Gerar Declaração';
        } else {
            btnGerar.textContent = `📄 Gerar ${count} Declarações`;
        }
    }
}

/**
 * Remove aluno da seleção
 */
function removerAlunoSelecionado(alunoId) {
    const index = window.alunosSelecionadosParaDeclaracao.indexOf(alunoId);
    if (index > -1) {
        window.alunosSelecionadosParaDeclaracao.splice(index, 1);
        
        // Atualizar checkbox
        const checkbox = document.querySelector(`input[data-aluno-id="${alunoId}"]`);
        if (checkbox) {
            checkbox.checked = false;
            const div = checkbox.closest('div[class*="p-3"]');
            div.classList.remove('bg-blue-100', 'border-l-4', 'border-l-blue-600');
            div.classList.add('hover:bg-gray-50');
        }
        
        atualizarListaAlunosSelecionados();
        
        const inputHidden = document.getElementById('selecionarAluno');
        if (window.alunosSelecionadosParaDeclaracao.length > 0) {
            inputHidden.value = window.alunosSelecionadosParaDeclaracao[0];
        } else {
            inputHidden.value = '';
        }
    }
}

/**
 * Abre o modal de visualização de declaração
 */
function openModalVisualizacao(alunoId) {
    const modal = document.getElementById('modalDeclaracao');
    modal.classList.remove('hidden');
    carregarDeclaracao(alunoId);
}

/**
 * Atualiza campos de notas conforme classe selecionada
 */
function atualizarCamposNotas() {
    const classe = document.getElementById('classe').value;
    const notasContainer = document.getElementById('notasContainer');
    const notasFieldset = document.getElementById('notasFieldset');
    
    console.log('Classe selecionada:', classe);
    
    if (!classe) {
        notasContainer.innerHTML = '<p class="text-gray-500">Selecione uma classe primeiro</p>';
        notasFieldset.style.display = 'block';
        return;
    }

    // Todas as classes mostram notas no formulário
    notasFieldset.style.display = 'block';
    const disciplinas = DISCIPLINAS[classe] || [];
    
    console.log('Disciplinas encontradas:', disciplinas);
    
    if (disciplinas.length === 0) {
        notasContainer.innerHTML = '<p class="text-gray-500">Nenhuma disciplina configurada para esta classe</p>';
        return;
    }
    
    let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
    
    disciplinas.forEach(disciplina => {
        const id = 'nota_' + disciplina.toLowerCase().replace(/[\s.]/g, '_');
        html += `
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">${disciplina}</label>
                <input type="number" 
                       id="${id}" 
                       min="0" 
                       max="10" 
                       step="0.1"
                       placeholder="0-10"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
        `;
    });
    
    html += '</div>';
    notasContainer.innerHTML = html;
    console.log('HTML gerado:', html.length, 'caracteres');
}

/**
 * Alias para compatibilidade com alunos.js
 */
function atualizarVisibilidadeNotas() {
    atualizarCamposNotas();
}

/**
 * Exibe mensagem de sucesso ou erro
 */
function mostrarMensagem(tipo, mensagem) {
    const tipoClasse = tipo === 'sucesso' 
        ? 'bg-green-500' 
        : tipo === 'erro' 
        ? 'bg-red-500' 
        : 'bg-blue-500';
    
    const div = document.createElement('div');
    div.className = `fixed top-4 right-4 ${tipoClasse} text-white px-6 py-3 rounded-lg shadow-lg z-40`;
    div.textContent = mensagem;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 3000);
}

/**
 * Mostra ou esconde o loader
 */
function mostrarLoader(show = true) {
    const loader = document.getElementById('loader');
    if (show) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

/**
 * Mostra notificação com Sweet Alert
 */
function notificacao(tipo, titulo, mensagem = '', tempo = 2000) {
    Swal.fire({
        icon: tipo,
        title: titulo,
        text: mensagem,
        timer: tempo,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false
    });
}

/**
 * Renderiza turmas e classes
 */
function renderizarTurmas(alunos) {
    const container = document.getElementById('turmasContainer');
    
    if (!alunos || alunos.length === 0) {
        container.innerHTML = `
            <div class="col-span-full">
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <p class="text-gray-500 text-lg">Nenhum aluno cadastrado</p>
                    <button onclick="openModal()" class="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                        + Adicionar Aluno
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // Agrupar por turma e classe
    const turmas = {};
    alunos.forEach(aluno => {
        const turma = aluno.turma || 'Sem Turma';
        const classe = aluno.classe || 'Sem Classe';
        
        if (!turmas[turma]) {
            turmas[turma] = {};
        }
        if (!turmas[turma][classe]) {
            turmas[turma][classe] = [];
        }
        turmas[turma][classe].push(aluno);
    });

    // Renderizar cards de turmas
    container.innerHTML = '';
    Object.keys(turmas).forEach(turma => {
        const classesDaTurma = turmas[turma];
        
        Object.keys(classesDaTurma).forEach(classe => {
            const alunosDaClasse = classesDaTurma[classe];
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow hover:shadow-lg transition p-6';
            
            let html = `
                <div class="mb-4">
                    <h3 class="text-lg font-bold text-blue-600"><span class="font-normal">Turma:</span> ${turma}</h3>
                    <p class="text-gray-600"><span class="font-normal">Classe:</span> ${classe}</p>
                    <span class="inline-block mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        <span class="font-normal">Alunos:</span> ${alunosDaClasse.length} aluno${alunosDaClasse.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <ul class="space-y-3 mb-4 max-h-48 overflow-y-auto">
            `;
            
            alunosDaClasse.forEach(aluno => {
                html += `
                    <li class="text-sm text-gray-700 flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span class="font-normal">✓ ${aluno.nome_completo}</span>
                        <div class="space-x-1">
                            <button onclick="editarAluno('${aluno.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs">✏️ Editar</button>
                            <button onclick="abrirModalGerarDeclaracao('${aluno.id}', '${turma}', '${classe}')" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs" title="Gerar Declaração">📄 Declaração</button>
                            <button onclick="deletarAlunoConfirm('${aluno.id}')" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">🗑️ Deletar</button>
                        </div>
                    </li>
                `;
            });
            
            html += `
                </ul>
                <button onclick="abrirModalGerarDeclaracao(null, '${turma}', '${classe}')" class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition mb-2">
                    📄 Gerar Declarações (Múltiplos Alunos)
                </button>
            `;
            
            card.innerHTML = html;
            container.appendChild(card);
        });
    });
}

/**
 * Imprime a declaração
 */
function imprimirDeclaracao() {
    const conteudo = document.getElementById('conteudoDeclaracao');
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <title>Declaração Escolar</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @media print {
                    body { margin: 0; padding: 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${conteudo.innerHTML}
            <div class="no-print mt-8 text-center">
                <button onclick="window.print()" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                    🖨️ Imprimir
                </button>
            </div>
        </body>
        </html>
    `);
    janelaImpressao.document.close();
}

/**
 * Exporta dados dos alunos em JSON ou CSV
 */
function exportarDados(formato = 'json') {
    return (async () => { // Make the function asynchronous
        try {
            if (!supabaseClient) {
                mostrarMensagem('erro', 'Banco de dados não configurado.');
                return;
            }
            mostrarLoader(true);
            const dados = await supabaseDB.getAlunos(); // Fetch directly from Supabase
            
            if (dados.length === 0) {
                mostrarMensagem('erro', 'Nenhum aluno para exportar');
                return;
            }

            let conteudo, tipo, nome;

            if (formato === 'json') {
                conteudo = JSON.stringify(dados, null, 2);
                tipo = 'application/json';
                nome = `alunos_${new Date().getTime()}.json`;
            } else if (formato === 'csv') {
                conteudo = converterParaCSV(dados);
                tipo = 'text/csv;charset=utf-8;';
                nome = `alunos_${new Date().getTime()}.csv`;
            } else {
                mostrarMensagem('erro', 'Formato inválido');
                return;
            }

            const link = document.createElement('a');
            const blob = new Blob([conteudo], { type: tipo });
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', nome);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            mostrarMensagem('sucesso', `Dados exportados em ${formato.toUpperCase()}`);
        } catch (erro) {
            console.error('Erro ao exportar dados:', erro);
            mostrarMensagem('erro', 'Erro ao exportar dados');
        } finally {
            mostrarLoader(false);
        }
    })(); // Execute the async function
}

/**
 * Converte array de objetos para CSV
 */
function converterParaCSV(dados) {
    if (!dados || dados.length === 0) return '';

    // Cabeçalhos
    const colunas = Object.keys(dados[0]);
    let csv = colunas.map(col => `"${col}"`).join(',') + '\n';

    // Linhas
    dados.forEach(linha => {
        const valores = colunas.map(col => {
            let valor = linha[col];
            if (valor === null || valor === undefined) return '';
            
            // Converter objetos para string
            if (typeof valor === 'object') {
                valor = JSON.stringify(valor).replace(/"/g, '""');
            } else {
                valor = String(valor).replace(/"/g, '""');
            }
            
            return `"${valor}"`;
        });
        csv += valores.join(',') + '\n';
    });

    return csv;
}
