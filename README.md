# Caderno de Receitas — Front-end (Angular 18)

Sem Angular Material (CSS puro) e **com o padrão de arquivos separado por
componente** que você está acostumada: cada componente tem seu próprio
`.ts`, `.html` e `.scss` (`templateUrl` / `styleUrl`), como o Angular CLI
gera por padrão (`ng generate component`).

## Como rodar

```bash
npm install
npm start        # http://localhost:4200
```

Usuário de teste (ou crie uma conta pela tela de Cadastro):

```
email: ana@exemplo.com
senha: Senha@123
```

## Estrutura de cada componente

```
recipe-card/
  recipe-card.component.ts     # lógica + decorator (templateUrl/styleUrl)
  recipe-card.component.html   # template
  recipe-card.component.scss   # estilos
```

Igual ao que `ng generate component nome` cria.

## Stack e decisões técnicas

- **Angular 18**, componentes standalone (sem NgModules), mas com
  `templateUrl`/`styleUrl` em arquivos separados.
- **Sem biblioteca de UI** — Design System próprio em `src/styles.scss`:
  tokens (`--rc-*`) + classes utilitárias (`.btn`, `.card`, `.field`,
  `.badge`, `.grid-cards`) reaproveitadas em todos os componentes.
- **Signals** para todo o estado (`AuthService`, `RecipeService`,
  `ToastService`) — `signal`, `computed`, `toObservable`.
- **Reactive Forms** com `FormArray` para ingredientes e passos
  dinâmicos (adicionar/remover), validações customizadas (senha forte,
  confirmação de senha) em `core/validators`.
- **Router**: rotas públicas, protegidas (`authGuard`), de visitante
  (`guestGuard`) e dinâmica (`/receitas/:id`), com transição animada.
- **HttpClient** com interceptors funcionais: `authInterceptor` (Bearer
  token) e `mockBackendInterceptor` (simula a API real).
- Modal de confirmação e player de vídeo são componentes próprios
  (sem lib) — ver `shared/components/confirm-modal` e `video-player`.

## Estrutura de pastas

```
src/
  main.ts                # bootstrap da aplicação
  index.html
  styles.scss            # design system (tokens + utilitários)
  environments/
  app/
    app.component.ts/html/scss
    app.config.ts         # providers (HttpClient, router, animações)
    app.routes.ts          # todas as rotas
    core/
      auth/               # AuthService (signals), guards, interceptor de token
      mocks/              # mock backend (interceptor) + dados semeados
      models/             # contratos de dados — CONTRATO DA API
      services/           # RecipeService, ToastService, utilitário de upload
      validators/         # validadores e mensagens de erro amigáveis
    shared/components/    # header, footer, recipe-card, confirm-modal,
                           # toast, media-uploader, video-player
    layout/main-layout/    # casca da aplicação
    features/
      auth/                # login, cadastro
      recipes/             # listagem, detalhe, formulário, minhas receitas
      profile/             # edição de perfil
```


## Requisitos do trabalho — onde cada um foi atendido

| Requisito | Onde |
|---|---|
| Componentização | `shared/components/*` |
| Responsivo mobile-first | `header.component.scss` (nav vira hambúrguer <768px), `.grid-cards` |
| Design System | tokens + classes utilitárias em `styles.scss` (sem lib) |
| Rotas públicas/protegidas/dinâmicas | `app.routes.ts` |
| Login/Cadastro + proteção client-side | `features/auth/*`, `auth.guard.ts` |
| CRUD via API | `RecipeService` + `mock-backend.interceptor.ts` |
| Formulário complexo + validação | `recipe-form.component.ts` (FormArray dinâmico) |
| Upload/exibição de imagem | `media-uploader.component.ts` |
| Vídeo com controles customizados | `video-player.component.ts` |
| Animações | rota (fade), hover no card, toasts, modal de confirmação |
| Signals | `AuthService`, `RecipeService`, `ToastService`, todos os componentes |
