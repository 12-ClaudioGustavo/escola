// Geração de Declarações Escolares

/**
 * Gera declaração para um ou múltiplos alunos com turma e ano letivo
 */
async function gerarDeclaracao(event) {
  // Prevenir comportamento padrão do formulário
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  try {
    const anoLetivo = document.getElementById("anoLetivoDeclaracao").value;

    // Verificar se há alunos selecionados
    const alunosSelecionados = window.alunosSelecionadosParaDeclaracao || [];

    if (alunosSelecionados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Por favor, selecione pelo menos um aluno",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!anoLetivo) {
      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Por favor, preencha o ano letivo",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // Buscar alunos selecionados
    const todosAlunos = await carregarAlunos();
    const alunos = todosAlunos.filter((a) => alunosSelecionados.includes(a.id));

    if (alunos.length === 0) {
      mostrarMensagem("erro", "Nenhum aluno encontrado");
      return;
    }

    mostrarLoader(true);

    // Se apenas um aluno, gerar PDF único
    if (alunos.length === 1) {
      const aluno = alunos[0];
      const turma = aluno.turma || "N/A";
      const html = gerarHTMLDeclaracao(aluno, turma, anoLetivo);
      const elemento = document.createElement("div");
      elemento.innerHTML = html;

      const opt = {
        margin: 10,
        filename: `declaracao_${aluno.nome_completo.replace(/\s/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Gerar PDF e abrir em nova aba
      const pdf = await html2pdf().set(opt).from(elemento).toPdf().get('pdf');
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      mostrarMensagem("sucesso", "Declaração PDF aberta em nova aba!");
    } else {
      // Múltiplos alunos - gerar um único PDF com todas as declarações
      await gerarDeclaracoesMultiplas(alunos, anoLetivo);
      mostrarMensagem(
        "sucesso",
        `PDF com ${alunos.length} declarações gerado com sucesso!`,
      );
    }

    // Fechar modal
    closeModalDeclaracao();
  } catch (erro) {
    console.error("Erro ao gerar declaração:", erro);
    mostrarMensagem("erro", "Erro ao gerar declaração em PDF");
  } finally {
    mostrarLoader(false);
  }
}

/**
 * Gera declarações para múltiplos alunos em um único PDF
 */
async function gerarDeclaracoesMultiplas(alunos, anoLetivo) {
  // Criar container com todas as declarações
  const container = document.createElement("div");
  
  alunos.forEach((aluno) => {
    const turma = aluno.turma || "N/A";
    const html = gerarHTMLDeclaracao(aluno, turma, anoLetivo);
    container.innerHTML += html;
  });

  const opt = {
    margin: 10,
    filename: `declaracoes_${alunos.length}_alunos.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  // Gerar PDF único com todas as páginas e abrir em nova aba
  const pdf = await html2pdf().set(opt).from(container).toPdf().get('pdf');
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

/**
 * Formata data de nascimento com mês em extenso
 * @param {string|Date} dataNascimento - Data de nascimento
 * @returns {string} Data formatada (ex: "15 de janeiro de 2010")
 */
function formatarDataNascimento(dataNascimento) {
  if (!dataNascimento) return "_______________";

  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const data = new Date(dataNascimento);
  if (isNaN(data.getTime())) return "_______________";

  const dia = data.getDate();
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();

  return `${dia} de ${mes} de ${ano}`;
}

/**
 * Formata data completa com mês em extenso para rodapé
 */
function formatarDataCompleta(data) {
  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const dia = data.getDate();
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();

  return `${dia} de ${mes} de ${ano}`;
}

/**
 * Converte nota numérica para classificação textual
 */
function obterClassificacaoTexto(nota) {
  if (nota >= 9) return "Muito Bom";
  if (nota >= 7) return "Bom";
  if (nota >= 5) return "Suficiente";
  return "Medíocre";
}

/**
 * Gera HTML de uma declaração individual no formato oficial
 */
function gerarHTMLDeclaracao(aluno, turma, anoLetivo) {
  const dataAtual = new Date();
  const dataFormatadaCompleta = formatarDataCompleta(dataAtual);

  // Formatar data de nascimento
  const dataNascimentoFormatada = formatarDataNascimento(aluno.nascimento);

  // Determinar pronomes baseado no gênero
  const pronomes =
    aluno.genero === "M"
      ? { filho: "filho", filha: "filho" }
      : { filho: "filha", filha: "filha" };

  // Gerar tabela de notas no formato oficial
  const tabelaNotas = gerarTabelaNotasOficial(aluno);

  // Calcular média e classificação final
  const todasAsNotas = Object.values(aluno.notas || {})
    .filter((nota) => notaValida(nota))
    .map((nota) => parseFloat(nota));

  const media = todasAsNotas.length > 0 ? calcularMedia(todasAsNotas) : 0;
  const classificacaoFinal = media > 0 ? obterClassificacaoTexto(media) : "";

  // Determinar texto da classificação final (pode ser texto ou valor)
  const classeInt = parseInt(aluno.classe);
  let textoClassificacaoFinal = "";

  // Para classes ímpares (1ª, 3ª, 5ª), usar classificação textual
  if (classeInt === 1 || classeInt === 3 || classeInt === 5) {
    textoClassificacaoFinal = media > 0 ? classificacaoFinal : "";
  } else {
    // Para classes pares (2ª, 4ª, 6ª), usar valor numérico
    if (media > 0) {
      const valorInt = Math.round(media);
      textoClassificacaoFinal = `(${valorInt.toString().padStart(2, "0")}) Valores`;
    }
  }

  // Obter número do aluno (se houver, senão usar índice)
  const numeroAluno = aluno.numero || "";

  let declaracaoHTML = `
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Declaração de Habilitações Literárias</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Times New Roman', Times, serif;
                    background: white;
                }

                .page {
                    width: 210mm;
                    height: 297mm;
                    padding: 20mm;
                    margin: 0 auto;
                    background: white;
                    position: relative;
                    page-break-after: always;
                }

                .border-frame {
                    border: 8px double #000080;
                    padding: 15px;
                    height: 100%;
                    position: relative;
                }

                .border-frame::before {
                    content: '';
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    right: 3px;
                    bottom: 3px;
                    border: 1px solid #000080;
                    pointer-events: none;
                }

                .header {
                    text-align: center;
                    margin-bottom: 25px;
                }

                .logo {
                    width: 60px;
                    height: 60px;
                    margin: 0 auto 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .logo img {
                    width: 60px;
                    height: 60px;
                    object-fit: contain;
                }

                .header h1 {
                    font-size: 11pt;
                    font-weight: bold;
                    margin: 3px 0;
                    text-transform: uppercase;
                }

                .header h2 {
                    font-size: 10pt;
                    font-weight: bold;
                    margin: 2px 0;
                    text-transform: uppercase;
                }

                .header h3 {
                    font-size: 10pt;
                    font-weight: normal;
                    margin: 8px 0 2px 0;
                    text-transform: uppercase;
                }

                .header h4 {
                    font-size: 11pt;
                    font-weight: bold;
                    margin: 8px 0;
                    text-transform: uppercase;
                    text-decoration: underline;
                }

                .content {
                    text-align: justify;
                    font-size: 10pt;
                    line-height: 1.4;
                    margin-bottom: 15px;
                }

                .content p {
                    margin-bottom: 10px;
                }

                .content strong {
                    font-weight: bold;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    font-size: 10pt;
                }

                table th, table td {
                    border: 1px solid #000;
                    padding: 6px 8px;
                    text-align: center;
                }

                table th {
                    font-weight: bold;
                    background: white;
                }

                table td:first-child {
                    width: 40px;
                }

                table td:nth-child(2) {
                    text-align: left;
                    padding-left: 10px;
                }

                .nota-mediocre {
                    color: red;
                    font-weight: bold;
                }

                .nota-negativa {
                    color: red;
                    font-weight: bold;
                }

                .nota-baixa {
                    font-weight: bold;
                }

                .footer {
                    margin-top: 20px;
                    font-size: 10pt;
                    line-height: 1.4;
                }

                .signature-section {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 10pt;
                }

                .signature-box {
                    text-align: center;
                    width: 45%;
                }

                .signature-line {
                    border-top: 1px solid #000;
                    margin: 40px auto 5px;
                    width: 200px;
                }

                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }

                    .page {
                        margin: 0;
                        page-break-after: always;
                    }
                }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="border-frame">
                    <div class="header">
                        <div class="logo">
                            <img src="${CONFIG_ESCOLA.insigniaAngola}" alt="Insígnia de Angola" onerror="this.style.display='none'">
                        </div>
                        <h1>REPÚBLICA DE ANGOLA</h1>
                        <h2>MINISTÉRIO DA EDUCAÇÃO</h2>
                        <h3>ENSINO GERAL</h3>
                        <h4>DECLARAÇÃO DE HABILITAÇÕES LITERÁRIAS</h4>
                    </div>

                    <div class="content">
                        <p><strong>a) ${CONFIG_ESCOLA.diretorNome}</strong>, Director do ${CONFIG_ESCOLA.nomeEscola} em ${CONFIG_ESCOLA.cidade}, declaro que <strong>${aluno.nome_completo}</strong>, ${pronomes.filho} de <strong>${aluno.nome_pai || "__________________"}</strong> e de <strong>${aluno.nome_mae || "__________________"}</strong>, Natural de ${aluno.naturalidade || "_______________"}, Município de ${aluno.municipio || "_______________"}, Província do ${aluno.provincia || "_______________"}, ${aluno.genero === "M" ? "Nascido" : "Nascida"} aos ${dataNascimentoFormatada}.</p>

                        <p>Frequentou nesta Escola no ano lectivo de ${anoLetivo} a <strong>${obterNomeClassePorExtenso(aluno.classe)}</strong>, turma: <strong>${turma || "____"}</strong>${numeroAluno ? " sob o nº " + numeroAluno : ""}, tendo a classificação final de <strong>${textoClassificacaoFinal || "_______________"}</strong> com as seguintes resultados:</p>

                        ${tabelaNotas}
                    </div>

                    <div class="footer">
                        <p>A Presente Declaração destina-se a <strong>Continuação de Estudos</strong>.</p>
                        <p>Para efeito de Troca de sala solicitada e assim constar dos documentos que ficam arquivados na secretaria, mandei passar a presente declaração que vai por mim assinada e autenticada com o carimbo e óleo em uso nesta Direcção.</p>
                        <p style="margin-top: 20px;"><strong>DIRECÇÃO DO ${CONFIG_ESCOLA.nomeEscola.toUpperCase()}, EM ${CONFIG_ESCOLA.cidade.toUpperCase()}, AOS ${dataFormatadaCompleta}.</strong></p>

                        <div class="signature-section">
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <p><strong>Conferidor Par</strong></p>
                            </div>
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <p><strong>O Director</strong></p>
                                <p><strong>${CONFIG_ESCOLA.diretorNome}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

  return declaracaoHTML;
}

/**
 * Obtém nome da classe por extenso
 */
function obterNomeClassePorExtenso(classe) {
  const classes = {
    1: "Primeira (1ª)",
    2: "Segunda (2ª)",
    3: "Terceira (3ª)",
    4: "Quarta (4ª)",
    5: "Quinta (5ª)",
    6: "Sexta (6ª)",
  };
  return classes[classe] || `${classe}ª`;
}

/**
 * Gera tabela de notas no formato oficial (ORD, DISCIPLINAS, CLASSIFICAÇÃO, OBSERVAÇÃO)
 */
function gerarTabelaNotasOficial(aluno) {
  if (!aluno.notas || Object.keys(aluno.notas).length === 0) {
    return "<p>Nenhuma nota registrada.</p>";
  }

  const disciplinas = DISCIPLINAS[aluno.classe] || [];
  const classeInt = parseInt(aluno.classe);
  let ord = 1;

  let html = `
        <table>
            <thead>
                <tr>
                    <th>ORD</th>
                    <th>DISCIPLINAS</th>
                    <th>CLASSIFICAÇÃO</th>
                    <th>OBSERVAÇÃO</th>
                </tr>
            </thead>
            <tbody>
    `;

  disciplinas.forEach((disciplina) => {
    const nota = aluno.notas[disciplina];
    if (notaValida(nota)) {
      const notaNum = parseFloat(nota);
      let classificacao = "";
      let classCSS = "";

      // Para classes ímpares (1ª, 3ª, 5ª), usar classificação textual
      if (classeInt === 1 || classeInt === 3 || classeInt === 5) {
        classificacao = obterClassificacaoTexto(notaNum);
        // Se for "Medíocre", aplicar estilo vermelho e negrito
        if (notaNum < 5) {
          classCSS = ' class="nota-mediocre"';
        }
      } else {
        // Para classes pares (2ª, 4ª, 6ª), usar valores numéricos
        const valorInt = Math.round(notaNum);
        classificacao = `(${valorInt.toString().padStart(2, "0")}) Valores`;
        // Notas abaixo de 10 valores (negativas) estarão em vermelho e negrito
        if (notaNum < 5) {
          classCSS = ' class="nota-negativa"';
        }
      }

      html += `
                <tr>
                    <td>${ord}</td>
                    <td>${disciplina}</td>
                    <td${classCSS}>${classificacao}</td>
                    <td></td>
                </tr>
            `;
      ord++;
    }
  });

  html += `
            </tbody>
        </table>
    `;

  return html;
}
function formatarData(dataString) {
  if (!dataString) return "";

  const data = new Date(dataString + "T00:00:00");
  return `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1).toString().padStart(2, "0")}/${data.getFullYear()}`;
}

/**
 * Carrega uma declaração para visualização
 */
async function carregarDeclaracao(alunoId) {
  const aluno = getAlunoPorId(alunoId);

  if (!aluno) {
    mostrarMensagem("erro", "Aluno não encontrado");
    return;
  }

  const conteudo = document.getElementById("conteudoDeclaracao");
  // Usar valores padrão se não estiverem disponíveis
  const turma = aluno.turma || "N/A";
  const anoLetivo =
    new Date().getFullYear() + "/" + (new Date().getFullYear() + 1);
  conteudo.innerHTML = gerarHTMLDeclaracao(aluno, turma, anoLetivo);
}

/**
 * Gera relatório com todas as notas de uma turma
 */
function gerarRelatorioTurma(classe, turma) {
  const alunos = getAlunosPorClasse(classe, turma);

  if (!alunos || alunos.length === 0) {
    return "<p>Nenhum aluno encontrado</p>";
  }

  const disciplinas = DISCIPLINAS[classe] || [];

  let html = `
        <div class="p-8">
            <h2 class="text-2xl font-bold mb-4">Relatório de Notas - ${classe} - ${turma}</h2>
            <table class="w-full border-collapse border border-gray-400">
                <thead>
                    <tr class="bg-blue-100">
                        <th class="border border-gray-400 px-4 py-2">Aluno</th>
    `;

  disciplinas.forEach((disciplina) => {
    html += `<th class="border border-gray-400 px-4 py-2">${disciplina}</th>`;
  });

  html += `<th class="border border-gray-400 px-4 py-2">Média</th></tr></thead><tbody>`;

  alunos.forEach((aluno) => {
    html += `<tr><td class="border border-gray-400 px-4 py-2">${aluno.nome_completo}</td>`;

    let totalNotas = [];
    disciplinas.forEach((disciplina) => {
      const nota = aluno.notas?.[disciplina] || "-";
      if (notaValida(nota)) {
        totalNotas.push(parseFloat(nota));
        html += `<td class="border border-gray-400 px-4 py-2 text-center">${nota}</td>`;
      } else {
        html += `<td class="border border-gray-400 px-4 py-2 text-center">-</td>`;
      }
    });

    const media = totalNotas.length > 0 ? calcularMedia(totalNotas) : "-";
    html += `<td class="border border-gray-400 px-4 py-2 text-center font-bold">${media}</td></tr>`;
  });

  html += `</tbody></table></div>`;

  return html;
}