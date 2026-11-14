// Conteúdo inicial do site, portado do design BOXtoBOX.
// Tudo isto é editável no modo admin; este ficheiro só é usado enquanto não houver conteúdo guardado.
// Campos entre [PARÊNTESES RETOS] aparecem a amarelo no site: são dados por confirmar.

const M = (f: string) => '/media/' + f;
const img = (src: string, alt = '', pos = '50% 50%', credit = '') => ({ src, alt, pos, credit });

const P = {
  intro: M('intro-bancada.jpg'),
  vozinha: M('vozinha.jpg'),
  festaGolo: M('festa-golo.jpg'),
  video: M('ayoni-golo.mp4'),
  helio: M('helio-varela.jpg'),
  estadio: M('estadio-nacional-praia.jpg'),
  apuramento: M('festa-apuramento.jpg'),
  cidadeVelha: M('cidade-velha.jpg'),
  pico: M('pico-lopes.jpg'),
  ryan: M('ryan-mendes.jpg'),
  liv: M('dailon-livramento.jpg'),
  deroy: M('deroy-duarte.jpg'),
  jamiro: M('jamiro-monteiro.jpg'),
  wagner: M('wagner-pina.jpg'),
  kevin: M('kevin-pina.jpg'),
  garry: M('garry-rodrigues.jpg'),
  can2021: M('can-2021-entrada.jpg')
};

const CREDITS_ALL =
  'Fotografias via Wikimedia Commons: Petsbikes (CC BY 4.0) · Diego Delso (CC BY-SA 4.0) · Lonzay (CC0) · Irish Football Fan TV (CC BY 3.0) · Biso (CC BY 4.0) · Loulesanggg (CC BY-SA 4.0) · Morgan Tencza (CC BY-SA 4.0) · senolsengul/Pixabay (CC0) · Дмитрий Пукалик (CC BY-SA 3.0) · Şadi Akdoğan (CC BY 4.0) · Effathéophile105 (CC BY-SA 4.0). Fotos e vídeo da FCF/[FONTE]: créditos a confirmar.';

const pl = (ini: string, name: string, x: number, y: number, hot = false) => ({ ini, name, x, y, hot });

const HOME_DEF = [
  pl('LI', 'Livramento', 38, 20), pl('WS', 'Willy Semedo', 62, 20), pl('RM', 'Ryan Mendes', 16, 45), pl('DD', 'Deroy Duarte', 39, 50),
  pl('JM', 'Jamiro Monteiro', 61, 50), pl('KP', 'Kevin Pina', 84, 45), pl('JP', 'João Paulo', 16, 72), pl('DI', 'Diney', 39, 76),
  pl('PI', 'Pico', 61, 76), pl('WP', 'Wagner Pina', 84, 72), pl('VO', 'Vozinha', 50, 92)
];
const HOME_ATK = [
  pl('LI', 'Livramento', 50, 9, true), pl('WS', 'Willy Semedo', 28, 17), pl('RM', 'Ryan Mendes', 10, 28), pl('DD', 'Deroy Duarte', 44, 31, true),
  pl('JM', 'Jamiro Monteiro', 62, 47), pl('KP', 'Kevin Pina', 86, 22, true), pl('JP', 'João Paulo', 12, 56), pl('DI', 'Diney', 38, 72),
  pl('PI', 'Pico', 62, 72), pl('WP', 'Wagner Pina', 88, 50), pl('VO', 'Vozinha', 50, 92)
];

const roster = (pos: number[][], names: string[][], hot: string[]) =>
  names.map((n, i) => pl(n[0], n[1], pos[i][0], pos[i][1], hot.includes(n[0])));
const BASE_NAMES = [['LI', 'Livramento'], ['WS', 'Willy Semedo'], ['RM', 'Ryan Mendes'], ['DD', 'Deroy Duarte'], ['JM', 'Jamiro Monteiro'], ['KP', 'Kevin Pina'], ['JP', 'João Paulo'], ['DI', 'Diney'], ['PI', 'Pico'], ['WP', 'Wagner Pina'], ['VO', 'Vozinha']];
const BANCO_NAMES = BASE_NAMES.map((n) => n.slice());
BANCO_NAMES[1] = ['HV', 'Hélio Varela'];
BANCO_NAMES[4] = ['GR', 'Garry Rodrigues'];
const ART_POS = {
  bloco: [[38, 20], [62, 20], [16, 45], [39, 50], [61, 50], [84, 45], [16, 72], [39, 76], [61, 76], [84, 72], [50, 92]],
  gatilho: [[36, 11], [62, 14], [12, 36], [39, 40], [61, 40], [86, 34], [16, 62], [39, 66], [61, 66], [84, 62], [50, 90]],
  transicao: [[50, 9], [28, 17], [10, 28], [44, 31], [62, 47], [86, 22], [12, 56], [38, 72], [62, 72], [88, 50], [50, 92]],
  banco: [[38, 18], [62, 18], [16, 44], [39, 50], [61, 50], [84, 44], [16, 72], [39, 76], [61, 76], [84, 72], [50, 92]]
};

export const seed = {
  version: 1,

  settings: {
    siteName: 'BOXtoBOX',
    tagline: 'A revista dos Tubarões Azuis',
    description:
      'A Box to Box é a revista de referência dos Tubarões Azuis: cobre a seleção de Cabo Verde de área a área, do relvado à diáspora.',
    slogan: 'De área a área, de ilha a ilha',
    sloganOptions: ['De área a área, de ilha a ilha', 'Todo o campo. Todas as ilhas.', 'O coração azul do arquipélago'],
    accent: '#F7D116',
    intro: true,
    instagram: '[@TEU_HANDLE]',
    socials: { instagram: '#', tiktok: '#', x: '#' },
    nav: [
      { label: 'Relvado', href: '/#taticas' },
      { label: 'Pessoas', href: '/#radar' },
      { label: 'Análise', href: '/artigos/o-4-4-2-de-bubista' },
      { label: 'Plantel', href: '/plantel' },
      { label: 'Raízes', href: '/#historia' },
      { label: 'Rubricas', href: '/radar' }
    ],
    cta: { label: 'Subscrever', href: '/#newsletter' },
    footerLine: 'A revista de referência dos Tubarões Azuis.',
    credits: CREDITS_ALL,
    replayIntro: 'Rever a abertura',
    hidden: [] as string[]
  },

  home: {
    intro: {
      tagline: 'A revista dos Tubarões Azuis',
      cities: ['Praia', 'Houston', 'Miami'],
      photo: img(P.intro, '', '30% 55%'),
      skip: 'Saltar abertura'
    },
    hero: {
      kicker: 'Relvado · Especial Mundial 2026',
      line1: 'Invictos',
      line2pre: 'em',
      line2serif: 'noventa',
      line2post: 'minutos.',
      line3: 'Contra todos.',
      lead:
        'Espanha, Uruguai, Arábia Saudita e Argentina. No primeiro Mundial da história, os Tubarões Azuis só caíram no prolongamento — frente à campeã do mundo. Isto é o que os números não contam.',
      cta1: { label: 'Ler a análise tática', href: '/#taticas' },
      cta2: { label: 'Rubrica Radar: Hélio Varela', href: '/radar/helio-varela' },
      photo: img(P.vozinha, '', '48% 18%'),
      badgeNum: '10',
      badgeText: 'ilhas, uma seleção'
    },
    stats: [
      { value: '4', suffix: '', label: "jogos sem perder nos 90'", accent: true },
      { value: '2.º', suffix: '', label: 'no Grupo H, à frente do Uruguai', accent: false },
      { value: '4', suffix: '', label: 'golos marcados, 2 à Argentina', accent: false },
      { value: '103', suffix: "'", label: 'o golaço de Sidny Lopes Cabral', accent: false }
    ],
    ticker: ['Espanha 0–0 Cabo Verde', 'Uruguai 2–2 Cabo Verde', 'Cabo Verde 0–0 Arábia Saudita', 'Argentina 3–2 Cabo Verde a.p.', '68.278 em Houston', "103' Lopes Cabral"],
    tags: ['Relvado', 'Pessoas', 'Raízes', 'Diáspora', 'Tática', 'Radar', 'Mundial 2026', 'Tubarões Azuis'],
    campaign: {
      kicker: 'Grupo H → 16 avos',
      title: 'A campanha,',
      titleSerif: 'jogo a jogo.',
      archive: { label: 'Arquivo de jogos →', href: '#' },
      team: 'Cabo Verde',
      matches: [
        { tag: 'Grupo H · J1 · Estreia', home: 'Espanha', hs: '0', as: '0', away: 'Cabo Verde', note: 'A estreia que estragou a estreia de uma das favoritas.', highlight: false },
        { tag: 'Grupo H · J2', home: 'Uruguai', hs: '2', as: '2', away: 'Cabo Verde', note: 'Golaço de Kevin Pina, reviravolta celeste, e Hélio Varela a empatar outra vez.', highlight: false },
        { tag: 'Grupo H · J3 · Houston', home: 'Cabo Verde', hs: '0', as: '0', away: 'Arábia Saudita', note: '68.278 no estádio e uma equipa inteira no relvado à espera do Espanha–Uruguai.', highlight: false },
        { tag: '16 avos · Miami · a.p.', home: 'Argentina', hs: '3', as: '2', away: 'Cabo Verde', note: "Deroy Duarte (59') e Lopes Cabral (103') fizeram a campeã sofrer até ao fim.", highlight: true }
      ]
    },
    video: {
      kicker: 'Em vídeo · Seleção',
      title: 'Ao terceiro jogo,',
      titleSerif: 'o primeiro golo.',
      text: 'Ayoni dos Santos precisou de três jogos para marcar pela seleção. São 19 segundos — vê-os com som.',
      credit: 'Vídeo: [FONTE — CONFIRMAR CRÉDITO E AUTORIZAÇÃO]',
      video: { src: P.video, label: 'Vídeo: Ayoni dos Santos marca o primeiro golo pela seleção de Cabo Verde' },
      photo: img(P.festaGolo, 'Dois jogadores de Cabo Verde abraçam-se a festejar um golo, com a bancada azul atrás', '50% 30%'),
      captionStrong: 'Festa em casa.',
      caption: 'Foto: [FCF — CONFIRMAR CRÉDITO]',
      bigWord: 'Golo'
    },
    band: {
      photo: img(P.helio, 'Hélio Varela conduz a bola perseguido por um jogador da Arábia Saudita, no Mundial 2026', '62% 40%', 'Foto: Petsbikes · CC BY 4.0'),
      kicker: 'Pessoas · Hélio Varela',
      lines: 'Entra.\nEmpata.',
      lineSerif: 'Repete.',
      link: { label: 'O super-suplente no Radar →', href: '/radar/helio-varela' }
    },
    manifesto: {
      kicker: 'Porquê Box to Box',
      lead: 'A revista de referência dos Tubarões Azuis — cobre a seleção de Cabo Verde de área a área, do relvado à diáspora.',
      text:
        'O nome vem do médio box-to-box — o jogador que liga a defesa ao ataque. É isso que queremos ser: a ligação entre as ilhas, a diáspora e a seleção. Contamos a história, o presente e o futuro do futebol cabo-verdiano com rigor, orgulho e profundidade, e damos voz a jogadores, treinadores, adeptos e comunidades emigrantes.',
      ringText: 'TUBARÕES AZUIS · CABO VERDE · MUNDIAL 2026 ·',
      photo: img(P.intro, '', '37% 50%'),
      bigWord: 'B2B',
      pillars: [
        { num: '01', name: 'Relvado', text: 'Jogos, análise tática, estatística e calendário.', href: '/#taticas', color: '#0F5A3A' },
        { num: '02', name: 'Pessoas', text: 'Perfis de jogadores, treinadores, adeptos, jornalistas e figuras históricas.', href: '/#radar', color: '#0B3B8C' },
        { num: '03', name: 'Raízes', text: 'História da seleção, futebol nas ilhas, formação e diáspora.', href: '/#historia', color: '#B3261E' }
      ]
    },
    tactics: {
      kicker: 'Relvado · Análise tática · 8 min',
      title: 'O 4-4-2 de Bubista:',
      titleSerif: 'linhas juntas, faca afiada.',
      text:
        'Cabo Verde não ganhou a posse a ninguém — ganhou o espaço. Duas linhas de quatro separadas por poucos metros, Livramento e Willy Semedo a fechar o primeiro passe, e um plano que não mudou nem contra a Argentina: sofrer junto e castigar a primeira hesitação.',
      link: { label: 'Ler análise completa →', href: '/artigos/o-4-4-2-de-bubista' },
      board: {
        phases: [
          {
            key: 'def',
            label: 'Sem bola',
            title: 'Sem bola',
            caption: 'Sem bola · vs Arábia Saudita, Houston. A faixa amarela marca o bloco médio.',
            band: true,
            notes: [
              { num: '01', t: 'O bloco', d: 'Médios por dentro, alas a recuar até à linha defensiva. Pico organiza.' },
              { num: '02', t: 'O gatilho', d: 'Livramento e Willy Semedo cortam o passe para o pivô. A pressão começa quando a bola vai para a ala.' },
              { num: '03', t: 'O banco', d: 'Garry Rodrigues pela experiência, Hélio Varela pela velocidade. Mudanças que viram jogos.' }
            ],
            players: HOME_DEF
          },
          {
            key: 'atk',
            label: 'Transição',
            title: 'Transição',
            caption: 'Transição · em amarelo, quem ataca a área no primeiro passe.',
            band: false,
            notes: [
              { num: '01', t: 'A recuperação', d: 'Bola ganha no bloco médio, primeiro passe vertical sem olhar para trás.' },
              { num: '02', t: 'A transição', d: 'Deroy Duarte e Kevin Pina a pisar a área quando a bola é recuperada.' },
              { num: '03', t: 'A largura', d: 'Wagner Pina sobe pelo corredor e prende o lateral adversário.' }
            ],
            players: HOME_ATK
          }
        ]
      }
    },
    squad: {
      title: 'Os Tubarões',
      titleSerif: 'de perto.',
      cta: { label: 'Ver o plantel completo', href: '/plantel' }
    },
    radar: {
      kicker: 'Pessoas · Rubrica Radar',
      title: 'Os nomes que',
      titleSerif: 'ninguém te contou.',
      text: 'Toda a gente conhece o Vozinha. Nós falamos dos outros — os que fizeram o Mundial acontecer sem aparecer no resumo.',
      cta: { label: 'Abrir a rubrica', href: '/radar' },
      lead: {
        photo: img(P.pico, 'Roberto Pico Lopes', '50% 22%', 'Foto: Irish Football Fan TV · CC BY 3.0'),
        big: 'DEF',
        badge: 'Nascido em Dublin',
        name: 'Roberto “Pico” Lopes',
        text: 'Central irlandês de pai cabo-verdiano, recrutado com uma mensagem no LinkedIn. Hoje é o chefe da defesa que travou Espanha e Uruguai.',
        href: '/radar/pico-lopes'
      },
      side: [
        { name: 'Hélio Varela', pos: 'AV', tag: 'Super-suplente', bg: '#B3261E', photo: img(P.helio, 'Hélio Varela', '68% 30%'), text: 'Saiu do banco para empatar com o Uruguai.', href: '/radar/helio-varela' },
        { name: 'Sidny Lopes Cabral', pos: 'AV', tag: 'Golo do Mundial?', bg: '#061633', photo: img('', 'Sidny Lopes Cabral'), text: 'Ao minuto 103, pôs a bola onde o Dibu não chegava.', href: '/radar/sidny-lopes-cabral' },
        { name: 'Deroy Duarte', pos: 'MED', tag: 'Motor do meio', bg: '#0F5A3A', photo: img(P.deroy, 'Deroy Duarte', '52% 22%'), text: 'Marcou à Argentina e liga bloco e ataque.', href: '/radar/deroy-duarte' }
      ]
    },
    history: {
      kicker: 'Raízes · História da seleção',
      title: 'De 10 ilhas',
      titleSerif: 'ao mata-mata.',
      photos: [
        { photo: img(P.estadio, 'Estádio Nacional de Cabo Verde, na Praia, com as bancadas cheias de adeptos de azul, visto do ar', '50% 62%', 'Foto: Lonzay · CC0'), caption: 'Estádio Nacional, Praia. Bancadas azuis.' },
        { photo: img(P.apuramento, 'Dois jogadores de Cabo Verde com t-shirts Tubarões Azuis World Cup 2026 seguram a bandeira nacional à frente da bancada cheia', '50% 40%', 'Foto: [FCF — confirmar]'), caption: 'A festa do apuramento.' }
      ],
      timeline: [
        { y: '2013', d: 'Primeira CAN de sempre — e logo até aos quartos de final.', dot: '#ffffff' },
        { y: '2024', d: 'CAN na Costa do Marfim: primeiros num grupo com Egito e Gana. Só os penáltis os pararam.', dot: '#ffffff' },
        { y: 'Out 25', d: 'Apuramento histórico na Praia, à frente dos Camarões. O primeiro Mundial.', dot: '#F7D116' },
        { y: 'Jun 26', d: 'Três empates no Grupo H, Uruguai eliminado, Argentina ao prolongamento.', dot: '#E03A3E' }
      ]
    },
    diaspora: {
      photo: img(P.cidadeVelha, 'Rapazes numa praia de areia preta em Cidade Velha, ilha de Santiago', '72% 50%', 'Foto: Loulesanggg · CC BY-SA 4.0'),
      kicker: 'Raízes · Diáspora',
      titlePre: 'Uma seleção feita',
      titleSerif: 'dentro e fora',
      titlePost: 'das ilhas.',
      text: 'Há mais cabo-verdianos fora das ilhas do que dentro — e a seleção é o retrato disso. Uma série sobre os caminhos que trouxeram cada jogador até ao azul.',
      countries: ['Portugal', 'Países Baixos', 'França', 'EUA', 'Luxemburgo'],
      link: { label: 'Ver a série →', href: '#' },
      igLabel: 'No Instagram ·',
      igLink: { label: 'Seguir →', href: '#' },
      posts: [
        { kicker: 'Carrossel · Tática', title: 'Como se trava a Espanha em 5 slides', bg: '#F7D116', fg: '#061633' },
        { kicker: 'Radar', title: 'Pico: do LinkedIn ao Mundial', bg: '#0B3B8C', fg: '#ffffff' },
        { kicker: "Reel · 103'", title: 'O golo que calou Miami', bg: '#B3261E', fg: '#ffffff' }
      ]
    },
    newsletter: {
      title: 'Uma análise\npor semana.',
      titleSerif: 'Zero conversa à toa.',
      label: 'O teu email',
      placeholder: 'o-teu@email.com',
      button: 'Subscrever',
      thanks: 'Obrigado! A próxima análise vai direta para o teu email.'
    }
  },

  players: [
    { id: 'voz', name: 'Vozinha', short: 'Vozinha', ini: 'VO', pos: 'gr', num: '1', captain: false, xi: [50, 91], strip: true, photo: img(P.vozinha, 'Vozinha', '50% 16%', 'Petsbikes · CC BY 4.0'), face: [47, 24, 1.9], tag: 'O rosto mais conhecido da seleção.', bio: 'Guarda-redes dos Tubarões Azuis no primeiro Mundial da história. Uma baliza que só caiu no prolongamento frente à campeã do mundo.', club: '[CLUBE]', radar: '' },
    { id: 'jp', name: 'João Paulo', short: 'João Paulo', ini: 'JP', pos: 'def', num: '', captain: false, xi: [15, 71], strip: false, photo: img('', 'João Paulo'), face: [50, 30, 1], tag: 'Lateral esquerdo do onze base.', bio: 'Titular no lado esquerdo da defesa no onze que empatou com a Arábia Saudita em Houston.', club: '[CLUBE]', radar: '' },
    { id: 'diney', name: 'Diney', short: 'Diney', ini: 'DI', pos: 'def', num: '', captain: false, xi: [38, 76], strip: false, photo: img('', 'Diney'), face: [50, 30, 1], tag: 'Central ao lado de Pico.', bio: 'A outra metade da dupla de centrais no 4-4-2 de Bubista.', club: '[CLUBE]', radar: '' },
    { id: 'pico', name: 'Pico Lopes', short: 'Pico', ini: 'PI', pos: 'def', num: '', captain: false, xi: [62, 76], strip: true, photo: img(P.pico, 'Pico Lopes', '50% 20%', 'Irish Football Fan TV · CC BY 3.0'), face: [50, 30, 1.7], tag: 'Nascido em Dublin. Chefe da defesa.', bio: 'Central irlandês de pai cabo-verdiano, recrutado com uma mensagem no LinkedIn. Organiza o bloco que travou Espanha e Uruguai.', club: '[CLUBE]', radar: 'pico-lopes' },
    { id: 'wagner', name: 'Wagner Pina', short: 'W. Pina', ini: 'WP', pos: 'def', num: '', captain: false, xi: [85, 71], strip: true, photo: img(P.wagner, 'Wagner Pina', '50% 30%', 'Şadi Akdoğan · CC BY 4.0'), face: [52, 38, 1.6], tag: 'O lateral que prende o lateral.', bio: 'Sobe pelo corredor direito na transição e obriga o lateral adversário a ficar em casa.', club: '[CLUBE]', radar: '' },
    { id: 'ryan', name: 'Ryan Mendes', short: 'Ryan Mendes', ini: 'RM', pos: 'med', num: '20', captain: true, xi: [15, 45], strip: true, photo: img(P.ryan, 'Ryan Mendes', '50% 12%', 'Petsbikes · CC BY 4.0'), face: [51, 12, 3.2], tag: 'Capitão. Ala esquerda.', bio: 'A braçadeira dos Tubarões Azuis no Mundial 2026. Recua até à linha defensiva sem bola e dá largura com ela.', club: '[CLUBE]', radar: '' },
    { id: 'deroy', name: 'Deroy Duarte', short: 'Deroy', ini: 'DD', pos: 'med', num: '', captain: false, xi: [38, 51], strip: true, photo: img(P.deroy, 'Deroy Duarte', '52% 20%', 'Biso · CC BY 4.0'), face: [52, 25, 3], tag: 'Marcou à Argentina, aos 59 minutos.', bio: 'Liga bloco e ataque. Pisa a área quando a bola é recuperada — e foi assim que marcou à campeã do mundo.', club: '[CLUBE]', radar: 'deroy-duarte' },
    { id: 'jamiro', name: 'Jamiro Monteiro', short: 'Jamiro', ini: 'JM', pos: 'med', num: '', captain: false, xi: [62, 51], strip: true, photo: img(P.jamiro, 'Jamiro Monteiro', '50% 18%', 'Morgan Tencza · CC BY-SA 4.0'), face: [48, 18, 2.6], tag: 'Médio-centro do bloco.', bio: 'Ao lado de Deroy Duarte no meio, fecha o espaço por dentro e dá a primeira saída de bola.', club: '[CLUBE]', radar: '' },
    { id: 'kevin', name: 'Kevin Pina', short: 'Kevin Pina', ini: 'KP', pos: 'med', num: '', captain: false, xi: [85, 45], strip: true, photo: img(P.kevin, 'Kevin Pina', '70% 18%', 'Дмитрий Пукалик · CC BY-SA 3.0'), face: [79, 13, 2.4], tag: 'O golaço contra o Uruguai.', bio: 'Ala direita no 4-4-2. Ataca a área na transição e assinou um dos golos da fase de grupos.', club: '[CLUBE]', radar: '' },
    { id: 'liv', name: 'Dailon Livramento', short: 'Livramento', ini: 'DL', pos: 'av', num: '19', captain: false, xi: [38, 20], strip: true, photo: img(P.liv, 'Dailon Livramento', '50% 12%', 'Petsbikes · CC BY 4.0'), face: [48, 12, 3.2], tag: 'Fecha o primeiro passe.', bio: 'Na frente, ao lado de Willy Semedo, corta a ligação ao pivô adversário e ataca a profundidade quando a bola é ganha.', club: '[CLUBE]', radar: '' },
    { id: 'willy', name: 'Willy Semedo', short: 'W. Semedo', ini: 'WS', pos: 'av', num: '', captain: false, xi: [62, 20], strip: false, photo: img('', 'Willy Semedo'), face: [50, 30, 1], tag: 'A dupla de Livramento.', bio: 'O outro avançado do 4-4-2: primeiro defensor da equipa e referência na saída rápida.', club: '[CLUBE]', radar: '' },
    { id: 'helio', name: 'Hélio Varela', short: 'Hélio', ini: 'HV', pos: 'av', num: '26', captain: false, xi: null, strip: true, photo: img(P.helio, 'Hélio Varela', '68% 28%', 'Petsbikes · CC BY 4.0'), face: [72, 26, 3], tag: 'Super-suplente.', bio: 'Saiu do banco para empatar com o Uruguai. A arma de velocidade que Bubista guarda para a última meia hora.', club: '[CLUBE]', radar: 'helio-varela' },
    { id: 'sidny', name: 'Sidny Lopes Cabral', short: 'Sidny', ini: 'SC', pos: 'av', num: '13', captain: false, xi: null, strip: false, photo: img('', 'Sidny Lopes Cabral'), face: [50, 30, 1], tag: "103' contra a Argentina.", bio: 'Pôs a bola onde o Dibu Martínez não chegava e fez Miami calar no prolongamento.', club: '[CLUBE]', radar: 'sidny-lopes-cabral' },
    { id: 'garry', name: 'Garry Rodrigues', short: 'Garry', ini: 'GR', pos: 'av', num: '', captain: false, xi: null, strip: true, photo: img(P.garry, 'Garry Rodrigues', '45% 30%', 'senolsengul/Pixabay · CC0'), face: [47, 30, 2.4], tag: 'A experiência do banco.', bio: 'Entra para segurar a bola e dar calma quando o jogo aperta.', club: '[CLUBE]', radar: '' }
  ],

  plantel: {
    heroPhoto: img(P.can2021, '', '60% 35%'),
    kicker: 'Pessoas · Seleção de Cabo Verde · Mundial 2026',
    title: 'Plantel',
    subPre: 'Da baliza',
    subSerif: 'ao ataque.',
    text: 'Os nomes que levaram os Tubarões Azuis ao primeiro Mundial e ao prolongamento com a campeã. Começa pelo onze — toca num jogador para o conhecer.',
    cta: { label: 'Ver o onze', href: '#onze' },
    heroCredit: 'Foto: entrada em campo na CAN 2021 · Effathéophile105 · CC BY-SA 4.0',
    xiKicker: 'Onze inicial · Cabo Verde 0–0 Arábia Saudita · Houston',
    xiTitle: 'O último',
    xiTitleSerif: 'onze.',
    systemLabel: 'Sistema',
    system: '4-4-2',
    coachLabel: 'Selecionador',
    coach: 'Bubista',
    pitchHint: 'Toca num jogador do campo ou do banco.',
    benchTitle: 'Banco',
    benchHint: 'Opções usadas no Mundial',
    radarLink: 'Ler no Radar →',
    groupTitles: { all: 'O plantel completo.', gr: 'A baliza.', def: 'A defesa.', med: 'O meio-campo.', av: 'O ataque.' },
    filters: { all: 'Todos', gr: 'Baliza', def: 'Defesa', med: 'Meio-campo', av: 'Ataque' },
    posNames: { gr: 'Guarda-redes', def: 'Defesa', med: 'Meio-campo', av: 'Avançado' },
    moreTitle: '[Restantes convocados]',
    moreText: 'Completar com a lista oficial dos 26 da FCF.',
    ctaTitle: 'Os que não\naparecem',
    ctaSerif: 'no resumo.',
    cta2: { label: 'Abrir a rubrica Radar', href: '/radar' }
  },

  rubrica: {
    kicker: 'Rubrica · Pessoas',
    schedule: 'Todas as semanas · [DIA DA SEMANA]',
    editionLabel: 'Edição n.º 04',
    title: 'Radar',
    subPre: 'Os nomes que',
    subSerif: 'ninguém te contou.',
    suggestCta: { label: 'Sugerir um nome', href: '#sugerir' },
    stripLabel: 'Na mira do Radar',
    stripHint: 'Passa o rato para ver a cor',
    rulesKicker: 'Como funciona',
    rulesTitle: 'Toda a gente conhece o Vozinha. O Radar existe para os outros.',
    rules: [
      { n: '01', t: 'Um nome por edição', d: 'Uma pessoa, contada a fundo. Nada de listas, nada de resumos.' },
      { n: '02', t: 'Nunca quem já foi capa', d: 'Se já apareceu no resumo do jogo, não é para o Radar.' },
      { n: '03', t: 'Do relvado à diáspora', d: 'Jogadores, sim — mas também roupeiros, treinadores de formação, adeptos e quem liga as ilhas à seleção.' }
    ],
    featuredKicker: 'Esta semana no Radar',
    featured: 'pico-lopes',
    featuredCta: 'Ler a edição',
    ticker: ['Um nome por semana', 'Pico Lopes', 'Sidny Lopes Cabral', 'Hélio Varela', 'Deroy Duarte', 'Quem é o próximo?'],
    archiveTitle: 'Arquivo',
    archiveSerif: 'do Radar.',
    filters: { all: 'Todos', def: 'Defesa', mid: 'Meio-campo', atk: 'Ataque' },
    galleryTitle: 'O Radar',
    gallerySerif: 'em imagens.',
    galleryHint: 'Clica numa foto para a abrir em grande. Setas para navegar.',
    gallery: [
      { photo: img(P.helio, 'Hélio Varela conduz a bola perseguido por um adversário', '62% 40%', 'Petsbikes · CC BY 4.0'), cap: 'Hélio Varela vs Arábia Saudita · Mundial 2026', c: 2, r: 2 },
      { photo: img(P.liv, 'Dailon Livramento com a camisola 19 de Cabo Verde', '50% 20%', 'Petsbikes · CC BY 4.0'), cap: 'Dailon Livramento · Mundial 2026', c: 1, r: 2 },
      { photo: img(P.ryan, 'Ryan Mendes com a braçadeira de capitão', '50% 15%', 'Petsbikes · CC BY 4.0'), cap: 'Ryan Mendes, capitão · Mundial 2026', c: 1, r: 2 },
      { photo: img(P.can2021, 'Jogadores de Cabo Verde entram em campo antes do jogo com a Etiópia', '55% 35%', 'Effathéophile105 · CC BY-SA 4.0'), cap: 'A entrada em campo · CAN 2021, Camarões', c: 2, r: 1 },
      { photo: img(P.jamiro, 'Jamiro Monteiro de braços no ar a festejar um golo', '50% 20%', 'Morgan Tencza · CC BY-SA 4.0'), cap: 'Jamiro Monteiro a festejar', c: 1, r: 2 },
      { photo: img(P.deroy, 'Deroy Duarte em jogo, de olho na bola', '50% 25%', 'Biso · CC BY 4.0'), cap: 'Deroy Duarte', c: 1, r: 1 },
      { photo: img(P.garry, 'Garry Rodrigues em campo', '45% 30%', 'senolsengul/Pixabay · CC0'), cap: 'Garry Rodrigues', c: 1, r: 1 },
      { photo: img(P.kevin, 'Kevin Pina a entrar em campo', '60% 25%', 'Дмитрий Пукалик · CC BY-SA 3.0'), cap: 'Kevin Pina', c: 1, r: 1 }
    ],
    suggest: {
      kicker: 'Próxima edição',
      title: 'Quem devia\nestar',
      titleSerif: 'no Radar?',
      text: 'Um roupeiro da Praia, um treinador de formação em Roterdão, uma adepta em Boston. Se fez a seleção acontecer sem aparecer no resumo, conta-nos.',
      nameLabel: 'Nome',
      namePh: 'Quem é?',
      whyLabel: 'Porque merece',
      whyPh: 'Em duas ou três frases.',
      button: 'Enviar sugestão',
      thanksTitle: 'Recebido.',
      thanksText: 'Vamos ler com atenção. Se a história for para o Radar, contactamos-te primeiro.',
      again: 'Sugerir outro nome'
    },
    moreTitle: 'Continua',
    moreSerif: 'a ler.',
    more: [
      { kicker: 'Relvado · Análise', title: 'O 4-4-2', titleSerif: 'de Bubista', text: 'Linhas juntas, faca afiada — o plano que levou Cabo Verde ao prolongamento com a Argentina.', href: '/artigos/o-4-4-2-de-bubista', bg: '#0F5A3A', photo: img(P.liv, '', '50% 15%') },
      { kicker: 'Pessoas', title: 'O plantel', titleSerif: 'completo', text: 'Quem é quem nos Tubarões Azuis, da baliza ao ataque.', href: '/plantel', bg: '#B3261E', photo: img(P.can2021, '', '60% 40%') }
    ]
  },

  edicao: {
    back: '← Rubrica Radar',
    demoBadge: 'Edição de demonstração · texto simulado',
    presents: 'BOXtoBOX apresenta',
    title: 'O Radar',
    sub: 'Os nomes que ninguém te contou',
    inThis: 'Nesta edição',
    freq: 'Semanal · Grátis',
    section: 'Rubrica semanal · Secção Pessoas',
    right: 'Tubarões Azuis · Mundial 2026',
    byPrefix: 'Por',
    desk: 'Redação BOXtoBOX',
    readPrefix: 'Leitura ·',
    quoteSuffix: 'em entrevista ao Radar',
    momentsTitle: 'Três momentos',
    momentsTag: 'Mundial 2026',
    fichaTitle: 'Ficha',
    numbersTitle: 'Em números',
    routeTitle: 'O percurso',
    opinionTitle: 'A opinião do Radar',
    opinionBy: '— A Redação',
    adKicker: 'Pequeno anúncio',
    adTitle: 'Conheces alguém que devia estar no Radar?',
    adText: 'Sugere um nome na página da rubrica →',
    alsoTitle: 'Também no Radar',
    alsoHint: 'Clica para mudar de edição',
    footnote:
      'Fotografias via Wikimedia Commons: Irish Football Fan TV (CC BY 3.0) · Petsbikes (CC BY 4.0) · Biso (CC BY 4.0). Fotos de clube usadas por falta de imagens livres com a camisola da seleção. Campos assinalados a amarelo por confirmar.'
  },

  editions: [
    {
      slug: 'pico-lopes',
      published: true,
      num: '04',
      name: 'Pico Lopes',
      fullName: 'Roberto “Pico” Lopes',
      posLong: 'Defesa central',
      group: 'def',
      groupLabel: 'Defesa',
      bg: '#0B3B8C',
      mono: '',
      photo: img(P.pico, 'Roberto Pico Lopes numa conferência de imprensa', '50% 18%', 'Irish Football Fan TV · CC BY 3.0'),
      caption: 'Pico Lopes numa conferência de imprensa do seu clube.',
      plate: '',
      plateSub: '',
      dateline: 'Dublin · Praia · Houston',
      date: '[DATA]',
      author: '[AUTOR]',
      read: '6 min',
      kicker: 'Defesa · De Dublin para o azul',
      headline: 'Do LinkedIn ao Mundial',
      summary: 'Do LinkedIn ao Mundial: o central de Dublin que organiza o bloco.',
      deck: 'Recrutado com uma mensagem numa rede profissional, o central nascido em Dublin tornou-se o homem que dita a altura da linha de Bubista.',
      body: [
        'Há convocatórias que chegam por telefone, outras por carta. A de Roberto Lopes chegou por mensagem no LinkedIn. Central nascido em Dublin, filho de pai cabo-verdiano, Pico respondeu a uma pergunta que muitos jogadores da diáspora conhecem: e se a seleção certa for a do outro lado da família?',
        'No Mundial 2026, a resposta ficou à vista. Contra Espanha e Arábia Saudita, Cabo Verde não sofreu golos. Contra o Uruguai, sofreu dois mas não perdeu. Em todos esses jogos, a linha defensiva subiu e desceu ao ritmo de um só jogador.',
        'O papel não aparece nas estatísticas habituais. Pico raramente é o homem do corte espetacular; é o que garante que o corte não é preciso. Fala, aponta, empurra a linha. Num 4-4-2 que vive da distância curta entre setores, isso vale tanto como um golo.',
        '[PARÁGRAFO A COMPLETAR COM ENTREVISTA: o primeiro contacto, a reação da família, a primeira chegada à Praia.]',
        'Quando a Argentina levou o jogo para prolongamento em Miami, a defesa que tinha travado Espanha continuava de pé. Caiu no fim, como cai quase toda a gente contra a campeã do mundo — mas caiu organizada, junta, fiel a uma ideia.'
      ],
      quote: '[Citação de Pico Lopes a recolher em entrevista]',
      moments: [
        { n: '01', t: 'Estreia · Espanha 0–0', d: 'A linha que não se partiu frente a uma das favoritas.' },
        { n: '02', t: 'J2 · Uruguai 2–2', d: 'Sofrer sem cair: o empate que valeu o apuramento.' },
        { n: '03', t: 'Houston · 0–0', d: 'O jogo da paciência, sem conceder um golo.' }
      ],
      ficha: [
        { k: 'Nome', v: 'Roberto “Pico” Lopes' }, { k: 'Posição', v: 'Defesa central' }, { k: 'Nasceu', v: 'Dublin, Irlanda' },
        { k: 'Ligação', v: 'Pai cabo-verdiano' }, { k: 'Clube', v: '[CLUBE — CONFIRMAR]' }, { k: 'No Mundial', v: '[X] jogos' }
      ],
      numbers: [
        { n: '2', l: 'jogos sem sofrer golos na fase de grupos' }, { n: '0', l: 'derrotas nos 90 minutos' }, { n: '4', l: 'jogos de Cabo Verde no Mundial' }
      ],
      route: [
        { p: 'Dublin', d: 'onde nasceu e se fez central' }, { p: 'LinkedIn', d: 'a mensagem que mudou tudo' },
        { p: 'Praia', d: 'a estreia com o azul' }, { p: 'Mundial 2026', d: 'o chefe da defesa' }
      ],
      opinion: 'Num futebol que celebra o drible, Pico lembra que defender também é criar: cria tempo, cria calma, cria o espaço onde os outros jogam.',
      featured: {
        badge: 'Defesa · Nascido em Dublin',
        title: 'Do LinkedIn',
        titleSerif: 'ao Mundial.',
        text: 'Central irlandês de pai cabo-verdiano, recrutado com uma mensagem no LinkedIn. Hoje é o chefe da defesa que travou Espanha e Uruguai — e o homem que organiza o bloco médio de Bubista.',
        facts: [{ k: 'Posição', v: 'Central' }, { k: 'Nasceu', v: 'Dublin' }, { k: 'No Mundial', v: '[X] jogos' }],
        readTime: '[X] min de leitura'
      }
    },
    {
      slug: 'sidny-lopes-cabral',
      published: true,
      num: '03',
      name: 'Sidny Lopes Cabral',
      fullName: 'Sidny Lopes Cabral',
      posLong: '[Posição a confirmar]',
      group: 'atk',
      groupLabel: 'Ataque',
      bg: '#061633',
      mono: '13',
      photo: img('', 'Sidny Lopes Cabral'),
      caption: 'Sem fotografia livre disponível: a página usa o minuto do golo como imagem.',
      plate: "103'",
      plateSub: 'Argentina 3–2 Cabo Verde · a.p.',
      dateline: 'Miami · 16 avos de final',
      date: '[DATA]',
      author: '[AUTOR]',
      read: '5 min',
      kicker: 'Ataque · Minuto 103',
      headline: 'O golo que fez Miami calar',
      summary: 'Minuto 103, Miami em silêncio. O golo e o que veio antes dele.',
      deck: 'Ao minuto 103, Sidny Lopes Cabral pôs a bola onde Dibu Martínez não chegava. Não chegou para seguir em frente — chegou para entrar na história.',
      body: [
        'Miami estava pintada de azul-celeste. A Argentina vencia, o prolongamento corria, e Cabo Verde parecia ter dado tudo o que tinha. Foi então que Sidny Lopes Cabral apareceu.',
        'O golo do minuto 103 não mudou o resultado final — a campeã do mundo acabou por vencer por 3–2 — mas mudou a forma como o mundo olhou para os Tubarões Azuis. Uma seleção de um arquipélago de dez ilhas obrigou a Argentina a sofrer até ao último minuto.',
        '[PARÁGRAFO A COMPLETAR: percurso de formação, clube atual e como chegou à seleção.]',
        'Para o Radar, o golo é apenas a porta de entrada. Interessa-nos o que veio antes: os anos sem holofotes, as escolhas, a decisão de vestir o azul. É essa a história que um resumo de dez segundos nunca conta.'
      ],
      quote: '[Citação de Sidny Lopes Cabral a recolher em entrevista]',
      moments: [
        { n: '01', t: 'Miami', d: 'Um estádio contra, uma seleção a acreditar.' },
        { n: '02', t: 'Minuto 103', d: 'O golo que ninguém fora das ilhas esperava.' },
        { n: '03', t: 'Apito final · 3–2', d: 'Cai a seleção, fica o nome.' }
      ],
      ficha: [
        { k: 'Nome', v: 'Sidny Lopes Cabral' }, { k: 'Posição', v: '[POSIÇÃO]' }, { k: 'Número', v: '13' },
        { k: 'Nasceu', v: '[LOCAL]' }, { k: 'Clube', v: '[CLUBE]' }, { k: 'No Mundial', v: "Golo aos 103' vs Argentina" }
      ],
      numbers: [{ n: "103'", l: 'o minuto do golo' }, { n: '3–2', l: 'resultado final, após prolongamento' }, { n: '13', l: 'o número nas costas' }],
      route: [
        { p: '[LOCAL DE NASCIMENTO]', d: 'onde tudo começou' }, { p: '[FORMAÇÃO]', d: 'os anos sem holofotes' },
        { p: '[CLUBE]', d: 'o clube atual' }, { p: 'Miami', d: 'o minuto 103' }
      ],
      opinion: 'Há golos que valem pontos e golos que valem memória. O de Sidny pertence à segunda categoria — e é por isso que merece mais do que um resumo.',
      featured: { badge: "Ataque · 103'", title: 'O golo que', titleSerif: 'fez Miami calar.', text: 'Ao minuto 103, Sidny Lopes Cabral pôs a bola onde Dibu Martínez não chegava.', facts: [{ k: 'Número', v: '13' }, { k: 'Golo', v: "103'" }, { k: 'Jogo', v: 'Argentina 3–2' }], readTime: '5 min de leitura' }
    },
    {
      slug: 'helio-varela',
      published: true,
      num: '02',
      name: 'Hélio Varela',
      fullName: 'Hélio Varela',
      posLong: 'Avançado',
      group: 'atk',
      groupLabel: 'Ataque',
      bg: '#B3261E',
      mono: '',
      photo: img(P.helio, 'Hélio Varela conduz a bola perseguido por um adversário', '62% 38%', 'Petsbikes · CC BY 4.0'),
      caption: 'Hélio Varela contra a Arábia Saudita, no Mundial 2026.',
      plate: '',
      plateSub: '',
      dateline: 'Grupo H · Mundial 2026',
      date: '[DATA]',
      author: '[AUTOR]',
      read: '5 min',
      kicker: 'Ataque · O super-suplente',
      headline: 'Entra. Empata. Repete.',
      summary: 'A arma de velocidade que Bubista guarda para a última meia hora.',
      deck: 'Saiu do banco para empatar com o Uruguai. Hélio Varela é a arma que Bubista guarda para a última meia hora — e a prova de que um plantel também se mede pelo banco.',
      body: [
        'Todas as equipas têm um plano A. As que vão longe têm um plano para quando o plano A se cansa. No Cabo Verde de Bubista, esse plano chama-se Hélio Varela.',
        'Contra o Uruguai, com a reviravolta celeste consumada, o selecionador foi ao banco. Hélio entrou, deu velocidade a um ataque já gasto e empatou o jogo. Um ponto que, no fim do grupo, valeu o apuramento à frente dos uruguaios.',
        'O papel de super-suplente é ingrato: pede-se a quem entra que mude o jogo em minutos, sem tempo para aquecer dentro dele. Hélio aceita-o como uma especialidade — e no Mundial transformou-a em assinatura.',
        '[PARÁGRAFO A COMPLETAR COM ENTREVISTA: percurso, clube atual e como encara o papel de suplente.]'
      ],
      quote: '[Citação de Hélio Varela a recolher em entrevista]',
      moments: [
        { n: '01', t: 'J2 · Uruguai', d: 'Sai do banco com o jogo a fugir.' },
        { n: '02', t: 'O empate · 2–2', d: 'O grupo volta a ficar em aberto.' },
        { n: '03', t: 'Fim do grupo', d: 'Cabo Verde à frente, Uruguai eliminado.' }
      ],
      ficha: [
        { k: 'Nome', v: 'Hélio Varela' }, { k: 'Posição', v: 'Avançado' }, { k: 'Número', v: '26' },
        { k: 'Nasceu', v: '[LOCAL]' }, { k: 'Clube', v: '[CLUBE]' }, { k: 'No Mundial', v: 'Golo do empate vs Uruguai' }
      ],
      numbers: [{ n: '26', l: 'o número nas costas' }, { n: '2–2', l: 'o empate frente ao Uruguai' }, { n: "30'", l: 'a última meia hora, o seu território' }],
      route: [
        { p: '[LOCAL DE NASCIMENTO]', d: 'onde tudo começou' }, { p: '[CLUBE]', d: 'o clube atual' },
        { p: 'Banco de Cabo Verde', d: 'a especialidade' }, { p: 'Uruguai 2–2', d: 'a assinatura' }
      ],
      opinion: 'Os resumos lembram-se de quem começa. As tabelas lembram-se de quem acaba. Hélio Varela joga para as tabelas.',
      featured: { badge: 'Ataque · Super-suplente', title: 'Entra. Empata.', titleSerif: 'Repete.', text: 'Saiu do banco para empatar com o Uruguai.', facts: [{ k: 'Posição', v: 'Avançado' }, { k: 'Número', v: '26' }, { k: 'Golo', v: 'Uruguai 2–2' }], readTime: '5 min de leitura' }
    },
    {
      slug: 'deroy-duarte',
      published: true,
      num: '01',
      name: 'Deroy Duarte',
      fullName: 'Deroy Duarte',
      posLong: 'Médio',
      group: 'mid',
      groupLabel: 'Meio-campo',
      bg: '#0F5A3A',
      mono: '',
      photo: img(P.deroy, 'Deroy Duarte em jogo, de olho na bola', '52% 26%', 'Biso · CC BY 4.0'),
      caption: 'Deroy Duarte em jogo pelo seu clube, em 2026.',
      plate: '',
      plateSub: '',
      dateline: 'Miami · 59 minutos',
      date: '[DATA]',
      author: '[AUTOR]',
      read: '6 min',
      kicker: 'Meio-campo · O verdadeiro box-to-box',
      headline: 'O médio que só se nota quando falta',
      summary: 'Marcou à Argentina. O médio que só se nota quando falta.',
      deck: 'Marcou à Argentina e passou o Mundial a ligar bloco e ataque. Deroy Duarte é o box-to-box que dá nome a esta revista.',
      body: [
        'Esta revista chama-se Box to Box por causa de jogadores como Deroy Duarte: o médio que defende na sua área e aparece na do adversário, que liga o que o sistema separa.',
        'No 4-4-2 de Bubista, Deroy é um dos dois homens por dentro. Fecha o espaço sem bola e, quando a equipa a recupera, é dos primeiros a pisar a área. Foi assim que, aos 59 minutos, marcou à Argentina em Miami.',
        'Deroy faz parte da geração da diáspora que escolheu o azul. Uma escolha que, no primeiro Mundial da história do país, se traduziu num golo à campeã do mundo.',
        '[PARÁGRAFO A COMPLETAR: formação, clube atual e ligação familiar a Cabo Verde.]',
        'Os números de um médio assim raramente enchem tabelas. Enchem-se os espaços que ele fecha e as linhas de passe que ele abre — e nota-se, sobretudo, nos jogos em que não está.'
      ],
      quote: '[Citação de Deroy Duarte a recolher em entrevista]',
      moments: [
        { n: '01', t: 'Estreia · Espanha 0–0', d: 'O bloco aguenta, o meio não se parte.' },
        { n: '02', t: "Miami · 59'", d: 'O golo à campeã do mundo.' },
        { n: '03', t: 'Prolongamento', d: 'Até ao fim, de área a área.' }
      ],
      ficha: [
        { k: 'Nome', v: 'Deroy Duarte' }, { k: 'Posição', v: 'Médio' }, { k: 'Nasceu', v: '[DATA · LOCAL]' },
        { k: 'Clube', v: '[CLUBE]' }, { k: 'No Mundial', v: "Golo aos 59' vs Argentina" }
      ],
      numbers: [{ n: "59'", l: 'golo à Argentina' }, { n: '2', l: 'médios por dentro no 4-4-2' }, { n: '[ANO]', l: 'ano de nascimento' }],
      route: [
        { p: '[LOCAL DE NASCIMENTO]', d: 'onde tudo começou' }, { p: '[FORMAÇÃO]', d: 'a escola de médio' },
        { p: '[CLUBE]', d: 'o clube atual' }, { p: "Miami · 59'", d: 'o golo' }
      ],
      opinion: 'Há jogadores que se veem nos resumos e jogadores que se veem nos resultados. Deroy pertence aos segundos. Já era tempo de o ver também nos primeiros.',
      featured: { badge: 'Meio-campo · Box-to-box', title: 'O médio que', titleSerif: 'só se nota quando falta.', text: 'Marcou à Argentina e passou o Mundial a ligar bloco e ataque.', facts: [{ k: 'Posição', v: 'Médio' }, { k: 'Golo', v: "59' vs Argentina" }, { k: 'Clube', v: '[CLUBE]' }], readTime: '6 min de leitura' }
    }
  ],

  articles: [
    {
      slug: 'o-4-4-2-de-bubista',
      published: true,
      pillar: 'relvado',
      kicker: 'Relvado · Análise tática',
      read: '8 min de leitura',
      titleLines: 'O 4-4-2\nde Bubista.',
      titleSerif: 'Linhas juntas, faca afiada.',
      summary: 'Como um plano simples, repetido sem medo, levou os Tubarões Azuis invictos até ao prolongamento com a campeã do mundo.',
      deck: 'Cabo Verde não ganhou a posse a ninguém — ganhou o espaço. Como um plano simples, repetido sem medo, levou os Tubarões Azuis invictos até ao prolongamento com a campeã do mundo.',
      author: '[AUTOR]',
      date: '[DATA DE PUBLICAÇÃO]',
      cover: img(P.helio, 'Hélio Varela conduz a bola perseguido por um jogador da Arábia Saudita, no Mundial 2026', '60% 42%'),
      coverCaption: 'Hélio Varela contra a Arábia Saudita, Mundial 2026. Foto: Petsbikes · CC BY 4.0',
      body: [
        { type: 'lead', text: 'Há equipas que se definem pelo que fazem com a bola. Cabo Verde, no Mundial 2026, definiu-se pelo que fez sem ela. Contra Espanha, Uruguai, Arábia Saudita e Argentina, o desenho foi sempre o mesmo: duas linhas de quatro, separadas por poucos metros, e dois avançados encarregados de tornar o primeiro passe adversário num problema.' },
        { type: 'p', text: 'Não é um sistema novo nem pretende sê-lo. O mérito está na disciplina — e na convicção de que, se o espaço entre linhas não existir, o talento do outro lado tem de procurar soluções por fora, onde a equipa está preparada para fechar.' },
        { type: 'h2', num: '01', text: 'O bloco' },
        { type: 'p', text: 'Sem bola, os médios fecham por dentro e as alas recuam até perto da linha defensiva. É aí que Pico Lopes manda: o central nascido em Dublin organiza a altura da linha e mantém os oito jogadores de campo à distância certa uns dos outros.' },
        { type: 'p', text: 'O resultado é um bloco médio compacto, que aceita que o adversário tenha a bola em zonas inofensivas e recusa-lhe o corredor central. Foi assim que Espanha ficou a zero na estreia.' },
        { type: 'phase', label: 'Ver o bloco no campo', phase: 0 },
        { type: 'quote', text: '“Sofrer junto e castigar a primeira hesitação.”', cite: 'O plano, em sete palavras' },
        { type: 'h2', num: '02', text: 'O gatilho' },
        { type: 'p', text: 'A pressão não começa ao acaso. Livramento e Willy Semedo posicionam-se para cortar a linha de passe para o pivô adversário. Enquanto a bola circula entre centrais, esperam. Quando segue para a ala, a equipa inteira sobe uns metros e a linha lateral passa a ser um defesa a mais.' },
        { type: 'p', text: 'É um gatilho simples de explicar e difícil de executar durante noventa minutos: exige que os médios saltem no momento certo e que a defesa acompanhe, para não abrir o espaço que o bloco passou o jogo a negar.' },
        { type: 'phase', label: 'Ver a pressão no campo', phase: 1 },
        { type: 'image', photo: img(P.can2021, 'Jogadores de Cabo Verde entram em campo na CAN 2021, nos Camarões', '55% 35%'), caption: 'A base deste grupo vem de longe: a entrada em campo na CAN 2021. Foto: Effathéophile105 · CC BY-SA 4.0' },
        { type: 'h2', num: '03', text: 'A transição' },
        { type: 'p', text: 'Recuperada a bola, a regra é não olhar para trás. O primeiro passe procura a vertical e dois homens atacam a área: Deroy Duarte e Kevin Pina, médios de origem, que nestes momentos se transformam em finalizadores. Do lado direito, Wagner Pina sobe e prende o lateral adversário, abrindo o espaço por dentro.' },
        { type: 'p', text: 'Foi numa destas chegadas que Deroy Duarte marcou à Argentina, aos 59 minutos. A equipa que mal tinha a bola precisou de muito pouco para a transformar em perigo.' },
        { type: 'phase', label: 'Ver a transição no campo', phase: 2 },
        { type: 'h2', num: '04', text: 'O banco' },
        { type: 'p', text: 'Um bloco destes cansa. Por isso a última meia hora é pensada à parte: Garry Rodrigues entra pela experiência e pela calma com bola; Hélio Varela pela velocidade contra defesas já gastas. Contra o Uruguai, foi do banco que veio o empate.' },
        { type: 'p', text: 'O desenho não muda — muda a energia de quem o executa. É a diferença entre aguentar e continuar a ameaçar.' },
        { type: 'phase', label: 'Ver a mudança no campo', phase: 3 },
        { type: 'h2', num: '05', text: 'Miami' },
        { type: 'p', text: 'Nos 16 avos, em Miami, o plano não mudou nem perante a campeã do mundo. Cabo Verde aguentou, marcou por Deroy Duarte e voltou a marcar no prolongamento, aos 103 minutos, pelo pé de Sidny Lopes Cabral. Acabou 3–2 para a Argentina.' },
        { type: 'p', text: 'Perdeu-se o jogo, não a ideia. Quatro jogos, nenhuma derrota nos noventa minutos, um apuramento à frente do Uruguai. Um 4-4-2 sem segredos — só com linhas juntas e uma faca afiada.' }
      ],
      tags: ['4-4-2', 'Bloco médio', 'Mundial 2026', 'Bubista'],
      boardKicker: 'Quadro tático',
      board: {
        phases: [
          { key: 'bloco', label: 'O bloco', title: 'O bloco', caption: 'Duas linhas de quatro, a poucos metros. Pico (em amarelo) dita a altura da linha.', band: true, notes: [], players: roster(ART_POS.bloco, BASE_NAMES, ['PI']) },
          { key: 'gatilho', label: 'O gatilho', title: 'O gatilho', caption: 'Bola na ala: os avançados (em amarelo) fecham o pivô e a equipa sobe.', band: false, notes: [], players: roster(ART_POS.gatilho, BASE_NAMES, ['LI', 'WS']) },
          { key: 'transicao', label: 'A transição', title: 'A transição', caption: 'Bola ganha: Deroy Duarte e Kevin Pina atacam a área, Wagner Pina dá largura.', band: false, notes: [], players: roster(ART_POS.transicao, BASE_NAMES, ['DD', 'KP', 'WP']) },
          { key: 'banco', label: 'O banco', title: 'O banco', caption: 'Última meia hora: Hélio Varela e Garry Rodrigues entram, o desenho fica.', band: true, notes: [], players: roster(ART_POS.banco, BANCO_NAMES, ['HV', 'GR']) }
        ]
      },
      relatedTitle: 'Os homens',
      relatedSerif: 'do plano.',
      related: [
        { name: 'Pico Lopes', label: 'O bloco', href: '/plantel', bg: '#0B3B8C', photo: img(P.pico, '', '50% 20%') },
        { name: 'Livramento', label: 'O gatilho', href: '/plantel', bg: '#0B3B8C', photo: img(P.liv, '', '50% 12%') },
        { name: 'Deroy Duarte', label: 'A transição', href: '/plantel', bg: '#0F5A3A', photo: img(P.deroy, '', '52% 20%') },
        { name: 'Hélio Varela', label: 'O banco', href: '/radar/helio-varela', bg: '#B3261E', photo: img(P.helio, '', '68% 28%') }
      ],
      credits: 'Fotografias via Wikimedia Commons: Petsbikes (CC BY 4.0) · Effathéophile105 (CC BY-SA 4.0) · Irish Football Fan TV (CC BY 3.0) · Biso (CC BY 4.0).'
    }
  ]
};

export type SiteContent = typeof seed;

/** Modelos para novos itens criados no modo admin. */
export const templates = {
  article: (slug: string) => ({
    slug,
    published: false,
    pillar: 'relvado',
    kicker: 'Relvado · Análise',
    read: '5 min de leitura',
    titleLines: 'Novo artigo',
    titleSerif: 'Subtítulo em itálico.',
    summary: 'Resumo curto do artigo.',
    deck: 'Entrada do artigo: duas ou três frases que puxam o leitor.',
    author: '[AUTOR]',
    date: '[DATA]',
    cover: img('', 'Imagem de capa'),
    coverCaption: 'Legenda da imagem. Foto: [CRÉDITO]',
    body: [
      { type: 'lead', text: 'Primeiro parágrafo, com letra capitular.' },
      { type: 'h2', num: '01', text: 'Primeira secção' },
      { type: 'p', text: 'Escreve aqui.' }
    ],
    tags: ['Etiqueta'],
    boardKicker: 'Quadro tático',
    board: clonePhases(),
    relatedTitle: 'Para continuar',
    relatedSerif: 'a ler.',
    related: [],
    credits: ''
  }),
  edition: (slug: string, num: string) => ({
    slug,
    published: false,
    num,
    name: 'Novo nome',
    fullName: 'Nome completo',
    posLong: 'Posição',
    group: 'mid',
    groupLabel: 'Meio-campo',
    bg: '#0B3B8C',
    mono: '',
    photo: img('', 'Fotografia'),
    caption: 'Legenda da fotografia.',
    plate: '',
    plateSub: '',
    dateline: 'Local · Contexto',
    date: '[DATA]',
    author: '[AUTOR]',
    read: '5 min',
    kicker: 'Secção · Ângulo',
    headline: 'Título da edição',
    summary: 'Uma linha para o arquivo do Radar.',
    deck: 'Entrada: quem é e porque importa.',
    body: ['Primeiro parágrafo.', 'Segundo parágrafo.'],
    quote: '[Citação]',
    moments: [{ n: '01', t: 'Momento', d: 'Descrição.' }],
    ficha: [{ k: 'Nome', v: 'Nome completo' }, { k: 'Clube', v: '[CLUBE]' }],
    numbers: [{ n: '0', l: 'descrição' }],
    route: [{ p: 'Origem', d: 'onde tudo começou' }],
    opinion: 'A opinião da redação.',
    featured: { badge: 'Posição · Destaque', title: 'Título', titleSerif: 'em destaque.', text: 'Texto de destaque.', facts: [{ k: 'Posição', v: '—' }], readTime: '5 min de leitura' }
  })
};

function clonePhases() {
  return { phases: [{ key: 'f1', label: 'Fase 1', title: 'Fase 1', caption: 'Descrição da fase.', band: true, notes: [], players: roster(ART_POS.bloco, BASE_NAMES, []) }] };
}
