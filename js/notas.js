// Funções de utilitários para cálculos e classificações

/**
 * Classifica uma nota conforme a escala
 * @param {number} nota - Nota de 0 a 10
 * @returns {object} Objeto com label e classe CSS
 */
function classificarNota(nota) {
    if (nota < 5) {
        return CLASSIFICACAO_NOTAS.medíocre;
    } else if (nota >= 5 && nota < 7) {
        return CLASSIFICACAO_NOTAS.suficiente;
    } else if (nota >= 7 && nota < 9) {
        return CLASSIFICACAO_NOTAS.bom;
    } else if (nota >= 9) {
        return CLASSIFICACAO_NOTAS.muitoBom;
    }
    return CLASSIFICACAO_NOTAS.suficiente;
}

/**
 * Arredonda uma nota para cima ou para baixo
 * @param {number} nota - Nota a arredondar
 * @param {string} tipo - 'excesso' ou 'defeito'
 * @returns {number} Nota arredondada
 */
function arredondarNota(nota, tipo = ARREDONDAMENTO.EXCESSO) {
    if (tipo === ARREDONDAMENTO.EXCESSO) {
        return Math.ceil(nota * 10) / 10; // Para cima
    } else {
        return Math.floor(nota * 10) / 10; // Para baixo
    }
}

/**
 * Calcula a média de um conjunto de notas
 * @param {array} notas - Array com as notas
 * @returns {number} Média arredondada
 */
function calcularMedia(notas) {
    if (!notas || notas.length === 0) return 0;
    const soma = notas.reduce((a, b) => a + parseFloat(b), 0);
    return arredondarNota(soma / notas.length);
}

/**
 * Obtém a descrição de classificação em HTML
 * @param {number} nota - Nota de 0 a 10
 * @returns {string} HTML com a classificação
 */
function getClassificacaoHTML(nota) {
    const classificacao = classificarNota(nota);
    return `<span class="${classificacao.classe}">${classificacao.label}</span>`;
}

/**
 * Valida se uma nota está entre 0 e 10
 * @param {number} nota - Nota a validar
 * @returns {boolean} True se válido
 */
function notaValida(nota) {
    const n = parseFloat(nota);
    return !isNaN(n) && n >= 0 && n <= 10;
}

/**
 * Converte objeto de notas para array
 * @param {object} notasObj - Objeto com notas por disciplina
 * @returns {array} Array com valores das notas
 */
function notasParaArray(notasObj) {
    return Object.values(notasObj || {})
        .filter(nota => notaValida(nota))
        .map(nota => parseFloat(nota));
}

/**
 * Calcula estatísticas de desempenho
 * @param {array} notas - Array de notas
 * @returns {object} Objeto com estatísticas
 */
function calcularEstatisticas(notas) {
    if (!notas || notas.length === 0) {
        return {
            media: 0,
            maiorNota: 0,
            menorNota: 0,
            aprovado: false,
            status: 'Sem dados'
        };
    }

    const notasNumero = notas.map(n => parseFloat(n));
    const media = calcularMedia(notasNumero);
    const maior = Math.max(...notasNumero);
    const menor = Math.min(...notasNumero);

    return {
        media: media,
        maiorNota: maior,
        menorNota: menor,
        aprovado: media >= 5,
        status: media < 5 ? 'Reprovado' : media < 7 ? 'Suficiente' : 'Bom'
    };
}
