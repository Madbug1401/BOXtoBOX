# BOXtoBOX — a revista dos Tubarões Azuis

Site da BOXtoBOX (seleção de futebol de Cabo Verde) com **modo admin**: o dono do site entra com uma palavra-passe e edita tudo diretamente na página — textos, fotos, vídeos, jogos, jogadores, posições no campo tático, artigos e edições do Radar.

Feito com Next.js 16 (App Router), pronto para a Vercel.

## Páginas

| Endereço | Página |
|---|---|
| `/` | Homepage (abertura animada, campanha, vídeo, manifesto, tática, plantel, radar, história, diáspora, newsletter) |
| `/radar` | Rubrica Radar (arquivo, galeria, sugestões) |
| `/radar/[slug]` | Cada edição do Radar, em formato de jornal |
| `/artigos/[slug]` | Artigos (ex.: `/artigos/o-4-4-2-de-bubista`, com quadro tático interativo) |
| `/plantel` | Plantel: onze no campo, banco e grelha com fichas |
| `/admin` | Entrada do modo admin |

---

## 1. Correr no teu computador

```bash
npm install
cp .env.example .env.local   # opcional em desenvolvimento
npm run dev
```

Abre http://localhost:3000 e, para editar, http://localhost:3000/admin.
Em desenvolvimento, sem `ADMIN_PASSWORD` definida, a palavra-passe é **`admin`** e o conteúdo é guardado em `.data/db.json` (os uploads vão para `public/uploads/`).

## 2. Enviar para o GitHub

O repositório já está iniciado com o primeiro commit. Cria um repositório vazio no GitHub (sem README) e:

```bash
git remote add origin https://github.com/O-TEU-UTILIZADOR/boxtobox.git
git push -u origin main
```

## 3. Publicar na Vercel

1. Em [vercel.com/new](https://vercel.com/new) importa o repositório do GitHub (deteta Next.js sozinho, sem configurar nada).
2. **Base de dados (obrigatória para guardar):** no projeto, separador **Storage** → **Create** / Marketplace → **Upstash Redis** (plano gratuito) → liga-o ao projeto. A Vercel cria as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
3. **Uploads de fotos/vídeos:** em **Storage** → **Blob** → cria uma store com acesso **Public** e liga-a ao projeto. A Vercel cria `BLOB_READ_WRITE_TOKEN`.
4. Em **Settings → Environment Variables** acrescenta:
   - `ADMIN_PASSWORD` — a palavra-passe do admin (usa uma forte);
   - `AUTH_SECRET` — uma string longa e aleatória (gera com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
5. **Redeploy** (Deployments → ⋯ → Redeploy) para as variáveis entrarem em vigor.
6. Abre `https://o-teu-site.vercel.app/admin`.

> Sem a base de dados ligada, o site funciona e mostra o conteúdo inicial, mas o admin não consegue guardar (a barra do admin mostra um aviso vermelho).

## 4. Como usar o modo admin

Depois de entrar, aparece uma barra no fundo do ecrã:

- **Editar site** — liga/desliga o modo edição. Com ele ligado:
  - **Textos**: clica em qualquer texto com contorno tracejado e escreve. Enter termina (nos textos de várias linhas, Enter muda de linha).
  - **Ligações**: o texto edita-se no sítio; o pequeno círculo amarelo (ícone de corrente) muda o endereço. No modo edição os links não navegam — usa **Páginas** ou Ctrl/Cmd+clique.
  - **Imagens/vídeo**: passa o rato → *Trocar imagem* (upload), *Foco* (clica no ponto que deve ficar sempre visível), *Alt* (descrição para acessibilidade), *URL*, *Remover*.
  - **Listas** (jogos, números, notas, países, posts, marcos, regras, galeria, parágrafos…): passa o rato num item → ↑ ↓ (ordem), ⧉ (duplicar), ✕ (apagar). Os botões azuis "+ …" acrescentam itens.
  - **Campo tático**: arrasta os jogadores para os reposicionar; por baixo do campo editas nomes, iniciais e destaque (amarelo) de cada fase.
  - **Plantel**: arrasta o onze no campo; clica num jogador (ou cartão) para o editar no painel — posição, número, capitão, onze/banco, faixa da homepage, ligação ao Radar, recorte da cara.
  - **Secções**: cada secção tem "Ocultar secção" no canto (fica escondida para os visitantes).
  - **Artigos**: blocos de texto, títulos, citações, imagens e botões que mexem no quadro tático.
- **↶ ↷** — desfazer/refazer (também Ctrl+Z / Ctrl+Shift+Z).
- **Guardar** (Ctrl+S) — publica as alterações. Nada fica visível aos visitantes antes disto.
- **Páginas** — navegar entre páginas, incluindo rascunhos.
- **Conteúdos** — criar, ordenar, publicar/despublicar, mudar endereço e apagar artigos e edições do Radar; escolher a edição em destaque.
- **Definições** — nome, slogan (e opções), cor de destaque, abertura animada, redes sociais, secções ocultas, exportar/importar cópia de segurança (.json), repor conteúdo de origem.
- **Caixa** — emails da newsletter (exportáveis em .csv) e sugestões de nomes para o Radar.
- **Histórico** — cada gravação guarda a versão anterior (últimas 15); podes restaurar qualquer uma.

Campos entre **[parênteses retos]** aparecem realçados a amarelo no site: são dados por confirmar.

## Fotos

Ver [`public/media/LEIA-ME.md`](public/media/LEIA-ME.md) — lista os ficheiros que o conteúdo inicial espera e os créditos.

## Estrutura do código

```
app/                      páginas e API (Next.js App Router)
  api/auth/*              login/logout (cookie httpOnly assinado)
  api/content             ler/guardar/repor o conteúdo (só admin)
  api/history             versões anteriores
  api/submissions         newsletter e sugestões (público envia, admin lê)
  api/upload              token de upload para o Vercel Blob (só admin)
  styles/*.css            estilos por página + admin
components/editor/        motor de edição (E, EImg, ELink, EList…) e barra/painéis do admin
components/pages/         Home, Radar, Edição, Artigo, Plantel
components/site/          cabeçalho, rodapé, campo tático
lib/seed.ts               conteúdo inicial (todo o texto do site)
lib/store.ts              armazenamento (Upstash Redis ou ficheiro local)
lib/auth.ts               sessão do admin
```

O conteúdo vive num único documento JSON. Se acrescentares campos novos ao `lib/seed.ts`, eles são fundidos automaticamente com o conteúdo já guardado.

## Segurança

- Uma única palavra-passe (`ADMIN_PASSWORD`); sessão em cookie `httpOnly`, `SameSite=Lax`, assinado com HMAC, válido 14 dias.
- Todas as rotas que alteram dados exigem sessão de admin e verificam a origem do pedido (proteção CSRF).
- Ligações e imagens editáveis passam por um filtro que bloqueia `javascript:` e afins; todo o texto é escapado pelo React.
- Rascunhos não são enviados aos visitantes (nem no HTML, nem nos dados da página).
- Formulários públicos têm validação, limites de tamanho e um campo-armadilha para bots.
