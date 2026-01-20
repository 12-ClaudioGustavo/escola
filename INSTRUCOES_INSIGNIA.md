# Instruções para Configurar a Insígnia de Angola

## Como Adicionar a Insígnia

1. **Obtenha a imagem PNG da Insígnia de Angola**
   - A imagem deve estar em formato PNG
   - Tamanho recomendado: 60x60 pixels ou maior (será redimensionada automaticamente)

2. **Coloque o arquivo na pasta correta**
   - Nome do arquivo: `insignia-angola.png`
   - Localização: `img/insignia-angola.png`
   - Caminho completo: `/home/claudiogc/Documents/colegio/sistema-declaracoes/img/insignia-angola.png`

3. **Alternativa: Usar URL Externa**
   - Se preferir hospedar a imagem em outro servidor
   - Edite o arquivo `js/config.js`
   - Altere o valor de `insigniaAngola` para a URL completa:
     ```javascript
     insigniaAngola: 'https://exemplo.com/caminho/insignia-angola.png'
     ```

## Configuração da Escola

Você pode personalizar os dados da escola editando `js/config.js`:

```javascript
const CONFIG_ESCOLA = {
    nomeEscola: 'Complexo Escolar nº 271',
    numeroEscola: '271',
    cidade: 'Mbanza Kongo',
    diretorNome: 'Alberto Fernando António',
    insigniaAngola: 'img/insignia-angola.png'
};
```

## Nota

Se a imagem não for encontrada, ela será ocultada automaticamente (não causará erro).
