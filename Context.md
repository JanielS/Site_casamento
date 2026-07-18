# Contexto do Projeto — Site de Casamento de Lina \& Janiel

## 1\. Objetivo

Desenvolver um site de casamento elegante, responsivo, minimalista e emocional para **Lina e Janiel**, com:

1. Página principal;
2. Página de presentes;
3. Acesso externo à localização da igreja no Google Maps;
4. Música contínua durante a navegação;
5. Formulário de confirmação de presença;
6. Exportação das confirmações para Excel;
7. Lista de presentes com reserva persistente e anônima para os demais visitantes.

O site deve funcionar muito bem tanto em celulares quanto em computadores, com prioridade para a experiência mobile.

\---

## 2\. Observação importante sobre a data

A data informada foi:

* **23/01/2027 às 18h00**
* Fuso horário: **America/Maceio (UTC-03:00)**

A data está no futuro em relação à data atual do projeto.

A data deve ser configurável por variável de ambiente ou arquivo de configuração:

```env
NEXT\_PUBLIC\_WEDDING\_DATE=2027-01-23T18:00:00-03:00
```

Caso a data já tenha passado, a contagem regressiva deve apresentar uma mensagem elegante, por exemplo:

> Chegou o nosso grande dia!

Não exibir números negativos.

\---

## 3\. Direção visual

### 3.1. Sensação desejada

O site deve transmitir:

* delicadeza;
* espiritualidade;
* leveza;
* romantismo;
* elegância;
* naturalidade;
* acolhimento.

A experiência não deve parecer rígida, excessivamente animada ou carregada.

### 3.2. Paleta obrigatória

Utilizar estritamente estas cores:

```css
:root {
  --color-wine: #8e412e;
  --color-orange: #cb5823;
  --color-olive-light: #b8b77e;
  --color-olive-dark: #657949;
  --color-white: #ffffff;
  --color-beige: #e6cebc;
}
```

Não inserir novas cores principais fora dessa paleta.

Variações de opacidade, transparência e gradientes entre essas mesmas cores são permitidas.

### 3.3. Tipografia

Usar uma combinação elegante:

* fonte serifada ou caligráfica discreta para nomes, títulos e destaques;
* fonte sem serifa limpa para textos, formulários e botões.

Evitar fontes caligráficas de baixa legibilidade.

### 3.4. Margaridas

A margarida será a flor temática do casamento.

Ela pode aparecer:

* como detalhe decorativo discreto;
* em pequenos elementos vetoriais;

Não utilizar margaridas em excesso.

As cores das ilustrações devem respeitar a paleta definida.

\---

## 4\. Arquitetura recomendada

### 4.1. Stack sugerida

Preferência por:

* Next.js com App Router;
* TypeScript;
* React;
* CSS Modules, Tailwind CSS ou solução equivalente;
* Framer Motion ou Intersection Observer para animações suaves;
* PostgreSQL, Supabase ou banco equivalente;
* Prisma ou cliente oficial do banco;
* ExcelJS ou biblioteca equivalente para exportação `.xlsx`;
* armazenamento de imagens, vídeos e áudio em serviço apropriado ou pasta pública, conforme o ambiente.

A implementação pode usar outra stack, desde que cumpra integralmente os requisitos.

### 4.2. Rotas

```text
/                   Página principal
/presentes          Página de presentes
/admin              Área protegida para administração
/api/rsvp           Cadastro e consulta de confirmações
/api/rsvp/export    Exportação das confirmações para Excel
/api/gifts           Consulta de presentes
/api/gifts/reserve   Reserva de presente
/api/gifts/release   Liberação de presente reservado
```

A localização da igreja não precisa ser uma página interna. Deve abrir diretamente o Google Maps.

### 4.3. Navegação

A transição entre `/` e `/presentes` deve ocorrer sem recarregamento completo da página.

Usar navegação client-side para preservar:

* música;
* posição de reprodução;
* volume;
* estado de play/pause;
* experiência visual contínua.

\---

## 5\. Recursos e arquivos que serão fornecidos

Criar uma área clara de configuração para substituição dos seguintes recursos:

```text
@NOME\_VIDEO
@NOME\_SENCAÇÃO
@NOME\_MUSICA
@NOME\_IMAGEM
@NOME\_FOTO
@NOME\_INSPIRAÇÃO
@NOME\_EXPERIENCIA
@URL\_GOOGLE\_MAPS
```

Sugestão de organização:

```text
/public
  /audio
    musica-casamento.mp3
  /images
    foto-casal.jpg
    referencia-hero.jpg
    inspiracao-confirmacao.jpg
    experiencia-presentes.jpg
  /videos
    abertura.mp4
```

Não inventar conteúdo para os arquivos ainda não fornecidos.

Quando um arquivo estiver ausente, apresentar um fallback visual elegante e registrar um `TODO` claro no código.

\---

## 6\. Comportamento global

### 6.1. Responsividade

O site deve ser totalmente responsivo.

Prioridades:

* mobile first;
* sem rolagem horizontal;
* textos legíveis;
* botões fáceis de tocar;
* imagens corretamente recortadas;
* vídeo adaptado ao tamanho da tela;
* formulários utilizáveis em telas pequenas;
* cards de presentes em daus colunas no celular e múltiplas colunas em telas maiores.

### 6.2. Animações

Os elementos devem surgir progressivamente durante a rolagem.

Usar animações discretas, como:

* fade-in;
* leve deslocamento vertical;
* pequena mudança de escala;
* transições de opacidade;
* stagger suave em grupos de cards.

Diretrizes:

* duração aproximada entre 300 ms e 500 ms;
* easing suave;
* sem animações bruscas;
* sem parallax intenso;
* sem excesso de elementos em movimento;
* respeitar `prefers-reduced-motion`.

### 6.3. Acessibilidade

Garantir:

* contraste suficiente;
* navegação por teclado;
* foco visível;
* textos alternativos nas imagens;
* labels nos campos;
* botões com nomes acessíveis;
* mensagens de erro claras;
* suporte a `prefers-reduced-motion`;
* ícones acompanhados de descrição acessível.

\---

## 7\. Música global e persistente

### 7.1. Requisito principal

A música @NOME\_MUSICA deve permanecer tocando durante toda a experiência do site.

Ao navegar da página principal para a página de presentes, a música deve:

* continuar no mesmo ponto;
* não reiniciar;
* não apresentar corte perceptível;
* preservar o estado de play ou pause;
* preservar o volume.

### 7.2. Implementação esperada

Criar um componente global, por exemplo:

```text
AudioProvider
GlobalAudioPlayer
useAudio
```

O elemento `<audio>` deve existir uma única vez no layout raiz da aplicação.

Não criar um novo player para cada página.

Persistir o estado em memória global e, quando apropriado, em `sessionStorage`.

### 7.3. Restrições de autoplay

Navegadores modernos podem bloquear reprodução automática com áudio.

Portanto:

1. Tentar iniciar a música ao carregar;
2. Se o navegador bloquear, exibir um convite discreto, como:

   * “Toque para viver esta experiência com música”;
3. Iniciar após a primeira interação do visitante;
4. Não apresentar erro técnico ao usuário.

### 7.4. Mini player

Posicionar um mini player discreto no lado direito, abaixo dos nomes do casal, na primeira seção.

O player deve conter:

* nome da música "O mundo é nós" ;
* Barra que a música está passando;
* botão play/pause;
* estado visual semelhante a um aplicativo de música;
* tamanho reduzido;
* boa usabilidade no celular.

Corrigir a terminologia:

* “pause”, não “pouse”;
* ao pausar, o botão passa a mostrar play;
* ao reproduzir, o botão passa a mostrar pause.
* Se a música chegar ao fim, deve reiniciar automaticamente

\---

# 8\. Página Principal

## 8.1. Parte 1 — Abertura com vídeo

### Conteúdo

A primeira visualização deve reproduzir o vídeo:

```text
@NOME\_VIDEO
```

A sensação visual deve se inspirar em:

```text
@NOME\_SENCAÇÃO\_PARTE01```

### Composição

O vídeo deve:

* ocupar a área principal da primeira dobra;
* ser responsivo;
* ter tratamento visual elegante;
* possuir fallback de imagem;
* usar `object-fit: cover`;
* não prejudicar a legibilidade dos textos;
* ser otimizado para carregamento.

A reprodução do vídeo pode ser:

* automática;
* sem áudio;
* em loop;
* com `playsInline`;
* com imagem de capa antes do carregamento.

### Transição para a seção seguinte

Na divisão entre o vídeo e a seção seguinte, exibir em destaque:

```text
Lina 𝄞 Janiel
```

Logo abaixo, em tamanho menor:

> Entre notas que elevaram nossa oração a Deus, nasceu um amor que hoje volta ao altar como oferta de nossas vidas.

O símbolo musical `𝄞` deve ser mantido.

A composição deve ter boa legibilidade sobre o vídeo ou sobre uma área de transição.

\---

## 8.2. Parte 2 — Contagem regressiva

Exibir o título:

```text
Contagem regressiva
```

Apresentar:

* dias;
* horas;
* minutos;
* segundos.

A contagem deve ser atualizada em tempo real.

Data configurada:

```text
23/01/2027 às 18h00
Timezone: America/Maceio
```

Requisitos:

* não apresentar valores negativos;
* manter alinhamento estável;
* ter boa leitura em celulares;
* usar números com largura visual consistente;
* cancelar corretamente o temporizador ao desmontar o componente.

\---

## 8.3. Parte 3 — Data, confirmação e fotografia

### Data

Exibir centralizado e em destaque:

```text
23/01/2027
```

Logo abaixo:

```text
Sábado às 18h00
```

Observação: 23/01/2027 corresponde corretamente a um sábado.

Preferencialmente, gerar o dia da semana automaticamente com base na data configurada para evitar inconsistências futuras.

### Botão

Exibir um botão:

```text
Confirmar presença
```

### Formulário

Ao clicar, abrir um pequeno formulário em modal, drawer ou bloco expansível.

Campos obrigatórios:

1. Nome da pessoa;
2. Você irá ao casamento?

   * Sim;
   * Não;
3. Número de pessoas;

   * campo numérico;
   * permitir digitação;
   * permitir aumentar e diminuir pelas setas.

Regras:

* nome obrigatório;
* resposta obrigatória;
* número de pessoas deve ser inteiro;
* mínimo de 1 quando a resposta for “Sim”;
* quando a resposta for “Não”, o número de pessoas pode ser definido como 0;
* mostrar confirmação de envio;
* impedir envios acidentais duplicados;
* tratar erros de conexão;
* não perder os dados durante o envio.

### Persistência

As respostas devem ser salvas em banco de dados.

Campos mínimos:

```text
id
name
willAttend
guestCount
createdAt
updatedAt
```

### Exportação Excel

Criar uma área administrativa protegida para:

* visualizar respostas;
* filtrar por presença confirmada;
* consultar total de convidados;
* exportar todas as respostas para `.xlsx`.

Colunas mínimas da planilha:

```text
Nome
Irá ao casamento?
Número de pessoas
Data da resposta
Última atualização
```

Nome sugerido do arquivo:

```text
confirmacoes-casamento-lina-janiel.xlsx
```

### Fotografia

Logo abaixo do botão ou do formulário, exibir:

```text
@NOME\_FOTO\_CONFIRMACAO
```

A composição deve se inspirar em:

```text
@NOME\_INSPIRAÇÃO\_PARTE02
```

\---

## 8.4. Parte 4 — Avisos

Criar uma seção com o título:

```text
Avisos importantes
```

Itens iniciais:

### Confirme sua presença

> Responda o quanto antes para nos ajudar na organização.

### Pontualidade é essencial

> Chegar atrasado pode atrapalhar a cerimônia.

### Silencie o celular

> Evite toques e notificações durante a cerimônia.

Apresentação sugerida:

* Formato de Cheklist;
* boa leitura no celular;
* sem aparência de alerta severo.

\---

## 8.5. Parte 5 — Local e presentes

Criar dois acessos principais:

### Local da cerimônia

* ícone de igreja;
* texto explicativo;
* botão ou card clicável;
* abrir @URL\_GOOGLE\_MAPS;
* abrir em nova aba;
* usar `rel="noopener noreferrer"`.

### Lista de presentes

* ícone de presente;
* texto explicativo;
* navegar para `/presentes`;
* preservar a música sem reiniciar.

\---

# 9\. Página de Presentes

## 9.1. Parte 1 — Abertura

A primeira parte deve ser visualmente idêntica à abertura da página principal.

Deve incluir:

* vídeo;
* nomes;
* frase;
* mini player;
* mesma composição visual.

Evitar duplicação desnecessária de código. Criar um componente reutilizável, por exemplo:

```text
HeroSection
```

A música deve continuar sincronizada ao navegar entre as páginas.

\---

## 9.2. Parte 2 — Mensagem

Exibir a frase:

> Nosso maior presente é a sua presença nesta celebração, testemunhando a vocação que Deus nos confiou. No entanto, sabendo que muitos desejam expressar seu carinho também por meio de um presente, deixamos aqui uma lista de sugestões.

O texto deve ter:

* boa largura de leitura;
* alinhamento elegante;
* destaque visual moderado;
* espaçamento confortável;
* entrada suave durante a rolagem.

\---

## 9.3. Parte 3 — Lista de presentes

Cada presente deve possuir:

* imagem;
* nome do item;
* botão “Presentear”;
* estado disponível;
* estado escolhido pelo visitante atual;
* estado escolhido por outra pessoa.

### Estado disponível

Exibir:

```text
Presentear
```

### Estado escolhido pelo visitante atual

Exibir claramente:

```text
Escolhido por você
```

Também disponibilizar:

```text
Desmarcar
```

### Estado escolhido por outra pessoa

Exibir:

```text
Presente já escolhido
```

Não revelar quem escolheu.

### Regras de negócio

1. Uma pessoa pode escolher mais de um presente;
2. Um presente não pode ser reservado simultaneamente por duas pessoas;
3. Todos os visitantes devem visualizar em tempo real ou após atualização que o item já foi escolhido;
4. Somente o visitante que escolheu o item pode desmarcá-lo;
5. O nome de quem escolheu nunca deve ser exibido publicamente;
6. A reserva deve ser persistente no banco;
7. O processo deve ser seguro contra cliques simultâneos;
8. O botão deve mostrar estado de carregamento;
9. Não usar apenas estado local para definir disponibilidade.

### Identificação anônima do responsável

Como não foi solicitado login, implementar reserva anônima com token seguro:

1. Ao reservar, gerar um token aleatório e criptograficamente seguro;
2. Salvar apenas o hash do token no banco;
3. Guardar o token original no navegador do visitante, preferencialmente em `localStorage`;
4. Para desmarcar, enviar o token;
5. O backend deve validar o hash;
6. Não permitir que outro navegador libere a reserva.

Limitação conhecida:

* se o visitante limpar os dados do navegador ou trocar de dispositivo, poderá perder a capacidade de desmarcar o presente.

Deixar a arquitetura preparada para futura adoção de:

* PIN secreto;
* link mágico;
* identificação por e-mail;
* área do convidado.

Não solicitar publicamente o nome de quem reservou, a menos que isso seja definido posteriormente.

### Concorrência

A reserva deve usar operação atômica ou transação no banco.

Não permitir:

* duas reservas para o mesmo presente;
* sobrescrita silenciosa;
* estado inconsistente entre interface e banco.

Em caso de conflito, retornar mensagem amigável:

> Este presente acabou de ser escolhido por outra pessoa.

### Experiência visual

Inspirar-se em:

```text
@NOME\_EXPERIENCIA\_PRESENTES
```

Usar:

* grid responsivo;
* cards com alturas consistentes;
* imagens com proporção padronizada;
* estados visuais claros;
* microinterações suaves;
* feedback imediato;
* sem excesso de animação.

\---

# 10\. Modelagem de dados sugerida

## 10.1. RSVP

```ts
type RSVP = {
  id: string;
  name: string;
  willAttend: boolean;
  guestCount: number;
  createdAt: Date;
  updatedAt: Date;
};
```

## 10.2. Gift

```ts
type Gift = {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

## 10.3. GiftReservation

```ts
type GiftReservation = {
  id: string;
  giftId: string;
  ownerTokenHash: string;
  createdAt: Date;
  updatedAt: Date;
};
```

Aplicar restrição única em `giftId`.

## 10.4. SiteSettings

Opcionalmente, centralizar configurações em:

```ts
type SiteSettings = {
  coupleNames: string;
  weddingDate: Date;
  churchMapsUrl: string;
  audioUrl: string;
  heroVideoUrl: string;
  heroPosterUrl: string;
};
```

\---

# 11\. Área administrativa

Criar uma área simples em `/admin`.

Ela deve ser protegida por autenticação.

No mínimo, permitir:

* visualizar confirmações;
* visualizar total de respostas;
* visualizar total de convidados confirmados;
* exportar Excel;
* visualizar presentes disponíveis e reservados;
* cadastrar, editar, ordenar e desativar presentes.

Não expor dados administrativos em endpoints públicos.

Configurações sensíveis devem ficar em variáveis de ambiente.

\---

# 12\. Segurança e privacidade

Implementar:

* validação no frontend e backend;
* sanitização de entradas;
* proteção contra spam;
* rate limit nos formulários e reservas;
* CSRF conforme a arquitetura utilizada;
* respostas de erro sem detalhes internos;
* variáveis de ambiente para credenciais;
* autenticação da área administrativa;
* conexão segura com banco;
* logs sem expor tokens;
* hash de tokens de reserva;
* restrições e índices no banco.

Não armazenar dados pessoais desnecessários.

Apresentar uma nota curta de privacidade junto ao formulário de presença, explicando que os dados serão usados apenas para a organização do casamento.

\---

# 13\. Desempenho

O site deve:

* carregar rapidamente em redes móveis;
* otimizar imagens;
* usar formatos modernos quando possível;
* carregar vídeo de forma controlada;
* evitar bloquear a primeira renderização;
* usar lazy loading abaixo da primeira dobra;
* evitar JavaScript desnecessário;
* evitar layout shift;
* exibir skeletons ou fallbacks elegantes quando necessário.

O vídeo não deve impedir o visitante de acessar o conteúdo caso a conexão seja lenta.

\---

# 14\. SEO e compartilhamento

Configurar:

* título da página;
* descrição;
* favicon;
* imagem de compartilhamento;
* Open Graph;
* idioma `pt-BR`;
* nomes do casal;
* data do casamento;
* texto adequado para compartilhamento em WhatsApp e redes sociais.

Não indexar a área administrativa.

\---

# 15\. Estrutura de componentes sugerida

```text
app/
  layout.tsx
  page.tsx
  presentes/
    page.tsx
  admin/
    page.tsx
  api/
    rsvp/
    gifts/

components/
  AudioProvider.tsx
  GlobalAudioPlayer.tsx
  HeroSection.tsx
  Countdown.tsx
  RSVPSection.tsx
  RSVPForm.tsx
  PhotoSection.tsx
  NoticesSection.tsx
  NavigationCards.tsx
  GiftGrid.tsx
  GiftCard.tsx
  DaisyDecoration.tsx
  Reveal.tsx
  Footer.tsx

lib/
  db.ts
  validations.ts
  audio.ts
  tokens.ts
  excel.ts
  constants.ts
```

Essa estrutura é apenas uma referência. Manter componentes coesos e reutilizáveis.

\---

# 16\. Critérios de aceite

## 16.1. Layout e responsividade

* \[ ] O site funciona corretamente em celular, tablet e desktop.
* \[ ] Não existe rolagem horizontal indevida.
* \[ ] O vídeo se adapta sem distorção.
* \[ ] O conteúdo permanece legível sobre fundos e imagens.
* \[ ] A paleta utiliza somente as cores definidas.
* \[ ] Margaridas aparecem apenas de forma discreta.

## 16.2. Música

* \[ ] Existe apenas um elemento global de áudio.
* \[ ] A música não reinicia ao navegar para presentes.
* \[ ] O play/pause funciona.
* \[ ] O estado visual do botão corresponde ao áudio.
* \[ ] Existe fallback para bloqueio de autoplay.
* \[ ] A experiência funciona em dispositivos móveis.

## 16.3. Contagem regressiva

* \[ ] A contagem usa o fuso `America/Maceio`.
* \[ ] Não exibe valores negativos.
* \[ ] Atualiza segundos corretamente.
* \[ ] Possui estado final após a data.
* \[ ] A data é configurável.

## 16.4. RSVP

* \[ ] O formulário valida os campos.
* \[ ] As respostas são persistidas.
* \[ ] O envio apresenta feedback.
* \[ ] A área administrativa lista as respostas.
* \[ ] A exportação gera um arquivo `.xlsx` válido.
* \[ ] O total de convidados é calculado corretamente.
* \[ ] A área administrativa é protegida.

## 16.5. Presentes

* \[ ] Os presentes são carregados do banco.
* \[ ] A reserva é persistente.
* \[ ] Um presente não pode ser reservado por duas pessoas.
* \[ ] Outros visitantes veem o item como escolhido.
* \[ ] O nome de quem escolheu não é exibido.
* \[ ] Somente o navegador proprietário pode desmarcar.
* \[ ] Uma pessoa pode escolher vários presentes.
* \[ ] O estado da interface é atualizado após cada ação.
* \[ ] Conflitos de reserva possuem mensagem amigável.

## 16.6. Acessibilidade e qualidade

* \[ ] Campos possuem labels.
* \[ ] Botões funcionam por teclado.
* \[ ] Foco é visível.
* \[ ] Imagens possuem texto alternativo.
* \[ ] `prefers-reduced-motion` é respeitado.
* \[ ] Não existem erros no console.
* \[ ] Não existem credenciais expostas no código.
* \[ ] O código possui tipagem consistente.

\---

# 17\. Testes mínimos

Criar testes para:

1. cálculo da contagem regressiva;
2. estado final da contagem;
3. validação do RSVP;
4. exportação para Excel;
5. reserva de presente disponível;
6. conflito de reserva simultânea;
7. tentativa de liberação com token inválido;
8. liberação com token válido;
9. continuidade do áudio entre rotas;
10. responsividade básica dos principais componentes.

Também realizar verificação manual em:

* Chrome desktop;
* Edge desktop;
* Safari iOS;
* Chrome Android.

\---

# 18\. Conteúdo textual consolidado

## Nomes

```text
Lina 𝄞 Janiel
```

## Frase principal

```text
Entre notas que elevaram nossa oração a Deus, nasceu um amor que hoje volta ao altar como oferta de nossas vidas.
```

## Mensagem da lista de presentes

```text
Nosso maior presente é a sua presença nesta celebração, testemunhando a vocação que Deus nos confiou. No entanto, sabendo que muitos desejam expressar seu carinho também por meio de um presente, deixamos aqui uma lista de sugestões.
```

## Avisos

```text
Confirme sua presença
Responda o quanto antes para nos ajudar na organização.

Pontualidade é essencial
Chegar atrasado pode atrapalhar a cerimônia.

Silencie o celular
Evite toques e notificações durante a cerimônia.
```

\---

\---

# 19\. Instrução final para o Codex

Implementar o projeto de ponta a ponta com foco em:

1. experiência mobile;
2. continuidade da música;
3. delicadeza visual;
4. confiabilidade das reservas;
5. persistência dos dados;
6. segurança;
7. acessibilidade;
8. facilidade de manutenção.

Não simular persistência com dados apenas locais.

Não deixar as funcionalidades principais apenas como mock.

Não reiniciar o áudio durante navegação interna.

Não revelar publicamente quem escolheu cada presente.

Não alterar silenciosamente a data informada.

Quando houver dúvida sobre um arquivo de mídia ainda não fornecido, usar um fallback elegante e deixar um `TODO` explícito.

