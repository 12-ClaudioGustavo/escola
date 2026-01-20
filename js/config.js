// Configuração do Supabase
const SUPABASE_URL = 'https://csfvhjfdxqotwrhtpeyi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZnZoamZkeHFvdHdyaHRwZXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDMzODgsImV4cCI6MjA4NDQxOTM4OH0.qwo5EbQRXFrKMPoo6V1n-fjsotN05j6QhiknJXsFgqk';

// Disciplinas por classe
const DISCIPLINAS = {
    '1': ['Língua Portuguesa', 'Matemática', 'Estudo do Meio', 'Educação M. e Plástica', 'Educação Músical', 'Educação Física', 'Lingua Kikongo'],

    '2': ['Língua Portuguesa', 'Matemática', 'Estudo do Meio', 'Educação M. e Plástica', 'Educação Músical', 'Educação Física', 'Lingua Kikongo'],

    '3': ['Língua Portuguesa', 'Matemática', 'Estudo do Meio', 'Educação M. e Plástica', 'Educação Músical', 'Educação Física', 'Lingua Kikongo'],

    '4': ['Língua Portuguesa', 'Matemática', 'Estudo do Meio', 
        'Educação M. e Plástica', 'Educação Músical', 'Educação Física', 'Lingua Kikongo'],

    '5': ['Língua Portuguesa', 'Matemática', 'Ciências da Natureza', 'História', 'Geografia', 'Educação M. e Cívica', 'Educação Musical', 'Educação Física', 'Língua Kikongo'],

    '6': ['Língua Portuguesa', 'Matemática', 'Ciências da Natureza', 'História', 'Geografia', 'Educação M. e Cívica', 'Educação Musical', 'Educação Física', 'Língua Kikongo']

};


// Classificação de notas
const CLASSIFICACAO_NOTAS = {
    'medíocre': { label: 'Medíocre', min: 0, max: 4.9, classe: 'text-red-600 font-bold' },
    'suficiente': { label: 'Suficiente', min: 5, max: 6.9, classe: 'text-gray-900' },
    'bom': { label: 'Bom', min: 7, max: 8.9, classe: 'text-gray-900' },
    'muitoBom': { label: 'Muito Bom', min: 9, max: 10, classe: 'text-gray-900' }
};

// Arredondamentos
const ARREDONDAMENTO = {
    EXCESSO: 'excesso',   // Para cima
    DEFEITO: 'defeito'    // Para baixo
};

// Classes que não possuem notas (se houver)
const CLASSES_SEM_NOTAS = [];

// Configurações da Escola
const CONFIG_ESCOLA = {
    nomeEscola: 'Complexo Escolar nº 271',
    numeroEscola: '271',
    cidade: 'Mbanza Kongo',
    diretorNome: 'Alberto Fernando António',
    // Caminho para a insígnia de Angola (PNG)
    // Coloque o arquivo PNG na pasta do projeto e ajuste o caminho
    insigniaAngola: 'img/insignia-angola.png' // ou URL completa se hospedada
};

// Nota: Supabase será inicializado em supabase.js após este arquivo carregar
