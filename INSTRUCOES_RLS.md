# Como Resolver o Erro de Row Level Security (RLS)

## Problema
O erro `new row violates row-level security policy` ocorre porque as políticas RLS do Supabase requerem autenticação para operações de INSERT/UPDATE/DELETE, mas o código atual não está autenticando usuários.

## Solução Rápida (Recomendada)

Execute o script SQL `UPDATE_RLS_POLICIES.sql` no Supabase SQL Editor:

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `UPDATE_RLS_POLICIES.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

Isso atualizará as políticas RLS para permitir operações públicas (sem necessidade de autenticação).

## Solução Alternativa (Com Autenticação)

Se você preferir manter segurança com autenticação:

1. Crie um usuário no Supabase Auth:
   - Vá em **Authentication** > **Users**
   - Clique em **Add User**
   - Crie um usuário com email e senha

2. Modifique `js/supabase.js` para fazer sign in automático:
   ```javascript
   async function verificarEAutenticar() {
       const { data, error } = await supabaseClient.auth.signInWithPassword({
           email: 'seu-email@exemplo.com',
           password: 'sua-senha'
       });
       // ...
   }
   ```

**Nota:** A solução rápida (executar o script SQL) é mais simples e adequada para sistemas internos/escolares.
