# Etapas do Projeto - Site de Casamento de Lina e Janiel

## Objetivo deste arquivo

Este documento serve como guia vivo de implementação. Ele mostra:

- a fase atual do projeto;
- o que já foi decidido;
- o que falta fazer;
- como cada etapa será validada antes de avançar;
- qual é a entrega final esperada.

Atualização esperada: ao concluir cada etapa, marcar o status correspondente e registrar o que foi validado.

## Fase atual

**Fase atual: Validação final e refinamento visual**

Situação neste momento:

- o objetivo do site já está definido;
- a stack principal já foi escolhida;
- a solução usa um **único arquivo Excel como fonte de verdade**;
- a área administrativa está protegida por senha em variável de ambiente;
- os arquivos de mídia definitivos estão integrados;
- a URL do Google Maps já foi configurada;
- a lista de presentes inicial já existe e é editável;
- o site principal, a página de presentes, o painel admin e as APIs já estão implementados;
- a navegação, o RSVP, a exportação `.xlsx`, a reserva de presentes e o áudio global já existem no código;
- o projeto já compila com `typecheck` e `build` aprovados;
- o trabalho atual está concentrado em ajustes finos de layout e validações manuais reais, principalmente em mobile.

## Status resumido das etapas

- Etapas 1 a 13: concluídas.
- Etapa 14: em validação final.
- Etapa 15: pendente até o fechamento final do projeto.

## Resumo das decisões já fechadas

- O projeto será feito em **Next.js com App Router e TypeScript**.
- O site terá uma experiência mobile-first.
- O arquivo Excel será o repositório principal de dados.
- O Excel será editado pela área `/admin`.
- RSVP, presentes e configurações vão viver em abas organizadas dentro do mesmo arquivo.
- A música global deve continuar tocando entre as rotas.
- O vídeo de abertura e as imagens foram definidos como definitivos.
- A página de presentes terá 20 itens iniciais gerados de forma comum e fácil de editar.
- As fotos dos presentes serão enviadas pelo admin e armazenadas como arquivos do site, com o Excel guardando a referência.
- O painel administrativo já está estruturado para editar settings, RSVP e presentes.
- Os endpoints públicos e administrativos já estão conectados ao workbook.
- A exportação `.xlsx` de RSVP já está disponível.

## Estrutura de execução

O projeto será construído em etapas encadeadas. Cada etapa abaixo tem:

- objetivo;
- implementação;
- validação;
- saída esperada.

---

## Etapa 1 - Fundação do projeto

### Objetivo

Criar a base técnica do site, com estrutura inicial, dependências e organização mínima para que o restante do projeto possa ser implementado com segurança.

### Implementação

- Inicializar o projeto em Next.js com App Router.
- Configurar TypeScript.
- Organizar a estrutura inicial de pastas.
- Definir o local do arquivo Excel principal.
- Preparar o arquivo de configuração de ambiente.
- Criar a base de estilos globais e tokens visuais da paleta do casamento.
- Definir a tipagem compartilhada do domínio.

### Validação

- O projeto sobe sem erros em desenvolvimento.
- A estrutura inicial fica clara e previsível.
- As variáveis de ambiente ficam documentadas.
- A paleta visual e os estilos globais carregam corretamente.
- Não há quebra de build por configuração incompleta.

### Saída esperada

- Base do aplicativo pronta para receber as telas e as regras de negócio.

---

## Etapa 2 - Modelo de dados no Excel

### Objetivo

Definir o arquivo Excel único como fonte de verdade do sistema, com abas bem organizadas e fáceis de editar pela área administrativa.

### Implementação

- Criar o arquivo Excel principal do projeto.
- Definir uma aba para configurações do site.
- Definir uma aba para RSVP.
- Definir uma aba para presentes.
- Definir uma aba para reservas de presentes.
- Definir uma aba para logs ou auditoria, se necessário.
- Estabelecer nomes de colunas claros e consistentes.
- Definir identificadores únicos para linhas importantes.
- Preparar leitura e escrita seguras no arquivo.

### Estrutura sugerida das abas

- `settings`
- `rsvp`
- `gifts`
- `gift_reservations`
- `audit_logs` ou equivalente, se necessário

### Validação

- O arquivo abre corretamente.
- As abas existem com os nomes esperados.
- Cada aba tem colunas coerentes com a funcionalidade.
- É possível ler os dados sem perda de informação.
- É possível escrever de volta sem corromper o arquivo.
- Uma alteração manual simples no Excel reflete corretamente na aplicação após nova leitura.

### Saída esperada

- Excel principal pronto para funcionar como banco de dados simples do projeto.

---

## Etapa 3 - Camada de acesso ao Excel

### Objetivo

Criar uma camada centralizada para ler, validar e gravar dados no Excel, evitando acesso direto espalhado pelo código.

### Implementação

- Criar funções para leitura do workbook.
- Criar funções para escrita segura no workbook.
- Criar funções específicas para RSVP.
- Criar funções específicas para presentes.
- Criar funções específicas para reservas.
- Criar funções para configurações globais.
- Padronizar tratamento de erros.
- Garantir que a leitura e a escrita respeitem o formato das abas.
- Preparar validação de dados de entrada antes da gravação.

### Validação

- As funções retornam dados corretos das abas.
- As gravações preservam a estrutura existente.
- Erros de formato são tratados de forma amigável.
- Não há duplicação indevida de lógica de acesso ao Excel.
- A camada permite evoluir o projeto sem acoplamento excessivo.

### Saída esperada

- Um módulo confiável de acesso ao arquivo Excel.

---

## Etapa 4 - Configuração de mídia e assets

### Objetivo

Organizar os arquivos de mídia do site de forma previsível, sem inventar conteúdo novo e sem perder os recursos definitivos já informados.

### Implementação

- Estruturar a pasta pública de assets.
- Referenciar a música global.
- Referenciar o vídeo de abertura.
- Referenciar as imagens de inspiração.
- Preparar fallback elegante para arquivos ausentes.
- Criar constantes centralizadas para caminhos de mídia.
- Garantir que a troca de um arquivo seja simples no futuro.

### Validação

- O site encontra os arquivos de mídia corretos.
- Se algum asset falhar, existe fallback visual elegante.
- Não há caminho quebrado em produção.
- A configuração de mídia fica simples de editar.

### Saída esperada

- Assets preparados para uso nas páginas principais e de presentes.

---

## Etapa 5 - Layout global e experiência contínua

### Objetivo

Criar a base visual compartilhada entre as páginas, preservando a música e a sensação contínua da navegação.

### Implementação

- Criar o layout raiz.
- Criar o provider global de áudio.
- Criar o mini player persistente.
- Garantir um único elemento de áudio na aplicação.
- Preservar estado de play, pause, volume e posição.
- Configurar persistência de estado em memória e, quando necessário, em `sessionStorage`.
- Preparar navegação client-side entre as rotas principais.
- Aplicar tipografia, paleta e espaçamento globais.

### Validação

- A música não reinicia ao trocar de página.
- O estado do player permanece consistente.
- O layout é responsivo.
- Não há duplicação do elemento de áudio.
- O visual global respeita a direção do projeto.

### Saída esperada

- Base compartilhada pronta para as páginas do site.

---

## Etapa 6 - Página inicial

### Objetivo

Construir a página principal com vídeo de abertura, nome do casal, frase principal, contagem regressiva, confirmação de presença, avisos e acessos principais.

### Implementação

- Montar a seção hero com vídeo.
- Aplicar fallback visual quando o vídeo não carregar.
- Exibir os nomes do casal com destaque.
- Inserir a frase principal do projeto.
- Implementar a contagem regressiva para a data do casamento.
- Exibir a data formatada corretamente.
- Implementar a seção de confirmação de presença.
- Implementar o formulário de RSVP.
- Exibir a foto definida para confirmação.
- Criar a seção de avisos importantes.
- Criar os cards de local da cerimônia e lista de presentes.

### Validação

- O vídeo aparece na primeira dobra.
- O conteúdo permanece legível sobre o fundo.
- A contagem regressiva atualiza em tempo real.
- Não aparecem números negativos.
- O formulário de RSVP abre, valida e envia corretamente.
- Os avisos ficam fáceis de ler no celular.
- O botão da igreja abre a URL correta em nova aba.
- O botão de presentes leva para `/presentes` sem reiniciar a música.

### Saída esperada

- Página inicial completa e utilizável.

---

## Etapa 7 - Contagem regressiva

### Objetivo

Garantir que a contagem do casamento funcione com precisão, respeito ao fuso definido e comportamento elegante após a data.

### Implementação

- Ler a data alvo de configuração.
- Considerar o fuso `America/Maceio`.
- Calcular dias, horas, minutos e segundos.
- Atualizar o valor a cada segundo.
- Cancelar o timer ao desmontar o componente.
- Exibir estado final quando a data já tiver passado.

### Validação

- O cálculo bate com a data configurada.
- Os valores não ficam negativos.
- A atualização acontece a cada segundo.
- O estado final substitui a contagem quando necessário.
- O timer é limpo corretamente.

### Saída esperada

- Contagem regressiva confiável e pronta para produção.

---

## Etapa 8 - RSVP e exportação

### Objetivo

Registrar confirmações de presença no Excel, permitir consulta administrativa e gerar exportação em `.xlsx`.

### Implementação

- Criar o formulário de RSVP com validação.
- Salvar nome, presença e número de convidados.
- Garantir que não existam envios duplicados acidentais.
- Exibir feedback de envio.
- Tratar falhas de rede sem perder dados digitados.
- Criar a listagem administrativa das respostas.
- Criar o filtro por presença confirmada.
- Calcular o total de convidados confirmados.
- Criar a exportação da planilha de RSVP.

### Validação

- O formulário só envia com dados válidos.
- O registro aparece corretamente no Excel.
- O admin exibe os dados gravados.
- O total de convidados confere com os registros.
- O arquivo exportado abre no Excel sem erro.
- Os dados não se perdem durante falha de rede.

### Saída esperada

- Fluxo completo de RSVP funcionando do início ao fim.

---

## Etapa 9 - Segurança da área administrativa

### Objetivo

Proteger a área `/admin` com uma solução simples e adequada ao fato de o site ser gerenciado apenas por você.

### Implementação

- Criar autenticação por senha única.
- Armazenar a senha em variável de ambiente.
- Restringir acesso às rotas administrativas.
- Evitar exposição de dados sensíveis em respostas públicas.
- Bloquear navegação sem autenticação válida.

### Validação

- Usuário não autenticado não acessa `/admin`.
- Senha correta libera a área administrativa.
- Senha inválida bloqueia o acesso.
- Dados sensíveis não aparecem em rotas públicas.

### Saída esperada

- Área administrativa protegida e simples de manter.

---

## Etapa 10 - Página de presentes

### Objetivo

Criar a lista de presentes com edição simples, fotos, estados de disponibilidade e reserva anônima persistente.

### Implementação

- Reutilizar a abertura visual da página principal.
- Exibir a mensagem introdutória da lista de presentes.
- Carregar os presentes a partir da aba de Excel.
- Mostrar imagem, nome e estado de cada item.
- Criar botão para presentear.
- Criar estado de item escolhido pelo visitante atual.
- Criar estado de item já escolhido por outra pessoa.
- Permitir desmarcar apenas pelo navegador que reservou.
- Gerar token anônimo seguro para cada reserva.
- Salvar apenas o hash do token no arquivo.
- Guardar o token original no navegador.
- Garantir que um presente não seja reservado por duas pessoas ao mesmo tempo.
- Preparar a interface para atualização de fotos e inclusão de novos itens pela área admin.

### Validação

- O item disponível mostra o botão correto.
- O item reservado por você mostra a ação de desmarcar.
- O item reservado por outra pessoa mostra o estado bloqueado.
- Dois cliques simultâneos não causam reserva dupla.
- O token do navegador proprietário libera a reserva corretamente.
- Um token inválido não libera o item.
- A interface reflete a fonte de verdade do Excel.

### Saída esperada

- Lista de presentes estável, editável e segura.

---

## Etapa 11 - Admin de presentes

### Objetivo

Permitir cadastrar, editar, ordenar, ativar, desativar e atualizar fotos dos presentes sem mexer no código.

### Implementação

- Criar listagem administrativa dos presentes.
- Criar formulário de cadastro.
- Permitir edição de nome, descrição, ordem e status.
- Permitir upload de foto pelo admin.
- Salvar o caminho da foto no Excel.
- Permitir inclusão de novos presentes.
- Permitir remoção lógica ou desativação.
- Permitir reorganização da ordem de exibição.

### Validação

- O admin cria novos presentes corretamente.
- A edição altera o item certo.
- A foto enviada fica acessível no site.
- A ordem reflete a alteração na interface pública.
- Itens desativados deixam de aparecer no site.

### Saída esperada

- Administração prática da lista de presentes.

---

## Etapa 12 - Confiabilidade de escrita no Excel

### Objetivo

Reduzir risco de corrupção do arquivo e evitar inconsistência entre leitura, edição e navegação do site.

### Implementação

- Criar escrita sequencial ou com bloqueio de acesso.
- Garantir salvamento atômico quando possível.
- Fazer backup temporário antes de sobrescrever.
- Tratar conflitos de gravação com mensagem amigável.
- Registrar operações relevantes em logs internos.
- Evitar edição concorrente do arquivo.

### Validação

- O arquivo não é corrompido em gravações consecutivas.
- Conflitos de escrita são tratados.
- Não há perda de dados após atualização de RSVP ou presentes.
- O sistema continua estável mesmo com múltiplas ações seguidas.

### Saída esperada

- Uso do Excel com risco controlado para o cenário do projeto.

---

## Etapa 13 - SEO, compartilhamento e acabamento

### Objetivo

Preparar o site para compartilhamento, busca, aparência pública e identidade visual final.

### Implementação

- Configurar título e descrição da página.
- Configurar imagem de compartilhamento.
- Configurar Open Graph.
- Ajustar idioma para `pt-BR`.
- Configurar favicon.
- Impedir indexação da área administrativa.
- Revisar textos finais.
- Ajustar detalhes de espaçamento e hierarquia visual.

### Validação

- O compartilhamento mostra título, imagem e descrição corretos.
- O idioma da página está consistente.
- A área administrativa não é indexada.
- O site fica bonito também fora do navegador principal.

### Saída esperada

- Site pronto para apresentação pública.

---

## Etapa 14 - Testes e verificação final

### Objetivo

Garantir que as funcionalidades principais se comportam como esperado antes da entrega final.

### Implementação

- Criar testes para o cálculo da contagem regressiva.
- Criar testes para o estado final após a data.
- Criar testes para validação do RSVP.
- Criar testes para exportação Excel.
- Criar testes para reserva de presente disponível.
- Criar testes para conflito de reserva simultânea.
- Criar testes para desmarcação com token inválido.
- Criar testes para desmarcação com token válido.
- Criar testes para continuidade do áudio entre rotas.
- Revisar responsividade dos principais componentes.

### Validação

- Os testes automáticos de build e typecheck já passam.
- O comportamento principal já foi verificado em navegação real local.
- O áudio permanece contínuo entre páginas.
- O formulário funciona bem em tela pequena.
- A lista de presentes responde corretamente a reserva e desmarcação.
- Ainda faltam validações manuais finais em dispositivos e navegadores reais.

### Saída esperada

- Projeto verificado e pronto para entrega.

---

## Etapa 15 - Entrega final e fechamento

### Objetivo

Fechar o projeto com documentação mínima, estado estável e instruções simples de manutenção.

### Implementação

- Conferir que todas as rotas estão funcionando.
- Revisar o arquivo Excel principal.
- Revisar os assets definitivos.
- Conferir as variáveis de ambiente necessárias.
- Revisar a área administrativa.
- Revisar a lista inicial de 20 presentes.
- Garantir que este arquivo esteja atualizado.

### Validação

- Todos os fluxos principais funcionam.
- O Excel está consistente.
- O admin está protegido.
- O site abre com os recursos corretos.
- As dúvidas remanescentes são apenas detalhes de manutenção.

### Saída esperada

- Entrega final pronta para uso.

---

## Ordem recomendada de execução

1. Fundação do projeto.
2. Modelo de dados no Excel.
3. Camada de acesso ao Excel.
4. Configuração de mídia e assets.
5. Layout global e áudio persistente.
6. Página inicial.
7. Contagem regressiva.
8. RSVP e exportação.
9. Segurança da área administrativa.
10. Página de presentes.
11. Admin de presentes.
12. Confiabilidade de escrita no Excel.
13. SEO, compartilhamento e acabamento.
14. Testes e verificação final.
15. Entrega final e fechamento.

## Critério para avançar entre etapas

Só avançar para a próxima etapa quando a etapa atual estiver validada por completo.

Se uma etapa falhar:

- corrigir o problema;
- validar de novo;
- só então seguir adiante.

## Forma de uso deste documento

- Use este arquivo como checklist de implementação.
- Marque o status de cada etapa durante o trabalho.
- Registre observações úteis quando surgirem detalhes de manutenção.
- Se o escopo mudar, atualize primeiro este documento e depois o código.

## Estado esperado ao final

Quando todas as etapas estiverem completas, o projeto deverá ter:

- site principal com música contínua;
- página de presentes com reserva persistente;
- admin protegido por senha;
- RSVP salvo no Excel;
- exportação `.xlsx`;
- edição simples dos dados;
- responsividade e acessibilidade adequadas;
- imagem e vídeo definitivos já integrados.

## Pendências de validação

Estas validações ainda devem ser executadas em ambiente real de uso:

- conferir o fluxo de login do admin com a senha final;
- conferir o upload de fotos no admin;
- validar a reserva e a liberação de presentes em navegação real;
- validar o formulário de RSVP preenchendo dados reais;
- validar a aparência final em mobile e desktop;
- testar manualmente a continuidade da música entre `/` e `/presentes`;
- revisar o texto final de alguns rótulos administrativos, se desejado.

## Observação de estado atual

O código já cobre a espinha dorsal do produto. O que segue agora é principalmente:

- ajuste fino de hierarquia visual;
- conferência do comportamento em telas pequenas;
- validação manual dos fluxos críticos;
- eventual polimento de textos e espaçamentos.

