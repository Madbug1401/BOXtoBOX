// Motor do Laboratório tático (Relvado).
// Mecânicas dos simuladores de gestão (Football Manager): formação, mentalidade, estilo tático,
// funções com dever (Defesa / Apoio / Ataque), instruções de equipa por momento, instruções individuais
// (bloqueadas pela função, "alterada" vs. padrão), adequação à posição, capacidade na função,
// familiaridade, intensidade, fluidez, bola parada e análise automática da tática.
// Tudo original; nomes e textos em português.

export type MomentKey = 'ataque' | 'defesa' | 'transof' | 'transdef' | 'bolaparada';
export const MOMENTS: { key: MomentKey; n: string; label: string; short: string; fm: string }[] = [
  { key: 'ataque', n: '01', label: 'Ataque', short: 'Ataque', fm: 'Com bola, organizado' },
  { key: 'defesa', n: '02', label: 'Defesa', short: 'Defesa', fm: 'Sem bola, organizado' },
  { key: 'transof', n: '03', label: 'Transição ofensiva', short: 'Trans. ofensiva', fm: 'Ao ganhar a bola' },
  { key: 'transdef', n: '04', label: 'Transição defensiva', short: 'Trans. defensiva', fm: 'Ao perder a bola' },
  { key: 'bolaparada', n: '05', label: 'Bola parada', short: 'Bola parada', fm: 'Cantos e livres' }
];

export type Slot = { code: string; x: number; y: number };
export type Duty = 'De' | 'Ap' | 'At';
export const DUTY_NAMES: Record<Duty, string> = { De: 'Defesa', Ap: 'Apoio', At: 'Ataque' };

/** Posições. */
export const POS_NAMES: Record<string, string> = {
  GR: 'Guarda-redes', DC: 'Defesa central', DE: 'Lateral esquerdo', DD: 'Lateral direito',
  ALE: 'Ala esquerdo', ALD: 'Ala direito', MDC: 'Médio defensivo', MC: 'Médio centro',
  ME: 'Médio esquerdo', MD: 'Médio direito', MCO: 'Médio ofensivo', EE: 'Extremo esquerdo',
  ED: 'Extremo direito', PL: 'Ponta de lança'
};
const GROUP: Record<string, 'gr' | 'def' | 'med' | 'av'> = {
  GR: 'gr', DC: 'def', DE: 'def', DD: 'def', ALE: 'def', ALD: 'def', MDC: 'med', MC: 'med', ME: 'med', MD: 'med', MCO: 'med', EE: 'av', ED: 'av', PL: 'av'
};
/** Posições "vizinhas": um jogador natural numa joga com à-vontade na outra. */
const NEAR: Record<string, string[]> = {
  DE: ['ALE', 'ME'], DD: ['ALD', 'MD'], ALE: ['DE', 'ME'], ALD: ['DD', 'MD'], DC: ['MDC'], MDC: ['MC', 'DC'], MC: ['MDC', 'MCO'],
  MCO: ['MC', 'PL'], ME: ['EE', 'ALE', 'MC'], MD: ['ED', 'ALD', 'MC'], EE: ['ME', 'ED', 'PL'], ED: ['MD', 'EE', 'PL'], PL: ['MCO', 'EE', 'ED'], GR: []
};

// Ordem dos 11 lugares: GR, defesas (esq→dir), médios, avançados. y = 0 é a baliza adversária.
const S = (code: string, x: number, y: number): Slot => ({ code, x, y });
const BACK4 = [S('GR', 50, 92), S('DE', 15, 72), S('DC', 38, 76), S('DC', 62, 76), S('DD', 85, 72)];
const BACK3 = [S('GR', 50, 92), S('DC', 28, 75), S('DC', 50, 78), S('DC', 72, 75)];
const BACK5 = [S('GR', 50, 92), S('ALE', 10, 66), S('DC', 30, 76), S('DC', 50, 79), S('DC', 70, 76), S('ALD', 90, 66)];
export const FORMATIONS: Record<string, Slot[]> = {
  '4-4-2': [...BACK4, S('ME', 15, 46), S('MC', 38, 51), S('MC', 62, 51), S('MD', 85, 46), S('PL', 38, 21), S('PL', 62, 21)],
  '4-4-1-1': [...BACK4, S('ME', 15, 47), S('MC', 38, 53), S('MC', 62, 53), S('MD', 85, 47), S('MCO', 50, 32), S('PL', 50, 16)],
  '4-3-3': [...BACK4, S('MC', 30, 49), S('MDC', 50, 58), S('MC', 70, 49), S('EE', 16, 24), S('PL', 50, 17), S('ED', 84, 24)],
  '4-2-3-1': [...BACK4, S('MDC', 38, 57), S('MDC', 62, 57), S('EE', 16, 34), S('MCO', 50, 36), S('ED', 84, 34), S('PL', 50, 16)],
  '4-1-4-1': [...BACK4, S('MDC', 50, 60), S('ME', 14, 42), S('MC', 36, 45), S('MC', 64, 45), S('MD', 86, 42), S('PL', 50, 17)],
  '4-1-2-1-2': [...BACK4, S('MDC', 50, 61), S('MC', 30, 50), S('MC', 70, 50), S('MCO', 50, 36), S('PL', 38, 19), S('PL', 62, 19)],
  '4-3-2-1': [...BACK4, S('MC', 30, 52), S('MC', 50, 56), S('MC', 70, 52), S('MCO', 36, 32), S('MCO', 64, 32), S('PL', 50, 16)],
  '3-5-2': [...BACK3, S('ALE', 10, 48), S('MC', 33, 52), S('MDC', 50, 60), S('MC', 67, 52), S('ALD', 90, 48), S('PL', 38, 20), S('PL', 62, 20)],
  '3-4-3': [...BACK3, S('ALE', 10, 50), S('MC', 38, 54), S('MC', 62, 54), S('ALD', 90, 50), S('EE', 18, 24), S('PL', 50, 17), S('ED', 82, 24)],
  '5-3-2': [...BACK5, S('MC', 30, 50), S('MC', 50, 54), S('MC', 70, 50), S('PL', 38, 21), S('PL', 62, 21)],
  '5-4-1': [...BACK5, S('ME', 16, 48), S('MC', 39, 52), S('MC', 61, 52), S('MD', 84, 48), S('PL', 50, 20)]
};

// ---------------------------------------------------------------------------
// Atributos (1–20). Avaliações da BOXtoBOX: estimativas editoriais, editáveis no admin.
export const ATTRS = ['Passe', 'Técnica', 'Drible', 'Finalização', 'Cabeceamento', 'Desarme', 'Posicionamento', 'Decisões', 'Trabalho de equipa', 'Aceleração', 'Força', 'Resistência', 'Reflexos'] as const;
export type Attr = (typeof ATTRS)[number];

/** Funções: dever(es) possíveis, atributos-chave, valores por omissão e instruções bloqueadas. */
export type Role = { key: string; name: string; abbr: string; desc: string; duties: Duty[]; keys: Attr[]; defaults?: Record<string, string>; locked?: string[]; playmaker?: boolean; wide?: boolean; inside?: boolean };
const R = (key: string, name: string, abbr: string, duties: Duty[], keys: Attr[], desc: string, defaults: Record<string, string> = {}, locked: string[] = [], extra: Partial<Role> = {}): Role => ({ key, name, abbr, duties, keys, desc, defaults, locked, ...extra });

const NO_ATK = ['runs', 'shoot', 'cross', 'crossFrom', 'crossTarget', 'hold', 'dribble'];
const GK = [
  R('gr', 'Guarda-redes', 'GR', ['De'], ['Reflexos', 'Posicionamento', 'Decisões', 'Cabeceamento'], 'Fica na baliza, comanda a área e joga simples.', { passRisk: 'Seguro' }, [...NO_ATK, 'width', 'freedom', 'press', 'closePass', 'mark', 'track', 'showOnto', 'tRun', 'tBack']),
  R('gr-libero', 'Guarda-redes líbero', 'GRL', ['De', 'Ap', 'At'], ['Reflexos', 'Passe', 'Aceleração', 'Decisões'], 'Sai da área para cobrir o espaço atrás de uma linha subida e participa na construção.', { passRisk: 'Arriscado' }, [...NO_ATK, 'width', 'press', 'closePass', 'mark', 'track', 'showOnto', 'tRun', 'tBack'], { playmaker: true })
];
const CB = [
  R('central', 'Defesa central', 'DC', ['De'], ['Desarme', 'Posicionamento', 'Cabeceamento', 'Força'], 'Defende primeiro: corta, cobre e não arrisca.', { passRisk: 'Seguro' }, ['runs', 'shoot', 'cross', 'crossFrom', 'crossTarget', 'hold', 'width', 'dribble']),
  R('central-org', 'Central organizador', 'DCO', ['De'], ['Posicionamento', 'Decisões', 'Cabeceamento', 'Passe'], 'Comanda a altura da linha e mantém a defesa ligada.', { passRisk: 'Normal' }, ['runs', 'shoot', 'cross', 'crossFrom', 'crossTarget', 'hold', 'width']),
  R('central-constr', 'Central construtor', 'DCC', ['De'], ['Passe', 'Técnica', 'Decisões', 'Posicionamento'], 'Conduz e procura o passe vertical a partir de trás.', { passRisk: 'Arriscado', dribble: 'Mais' }, ['shoot', 'cross', 'crossFrom', 'crossTarget', 'hold', 'width'], { playmaker: true }),
  R('central-simples', 'Central sem rodeios', 'DCS', ['De'], ['Desarme', 'Cabeceamento', 'Força', 'Posicionamento'], 'Afasta a bola sem pensar duas vezes.', { passRisk: 'Seguro', dribble: 'Menos' }, ['runs', 'shoot', 'cross', 'crossFrom', 'crossTarget', 'hold', 'width', 'freedom', 'passRisk', 'dribble'])
];
const FB = [
  R('lateral', 'Lateral', 'L', ['De', 'Ap', 'At'], ['Desarme', 'Posicionamento', 'Resistência', 'Aceleração'], 'Equilibra: sobe quando há espaço, recua cedo.', {}, ['hold']),
  R('lateral-of', 'Lateral completo', 'LC', ['Ap', 'At'], ['Aceleração', 'Resistência', 'Drible', 'Passe'], 'Dá largura, cruza e chega ao último terço.', { cross: 'Mais', width: 'Mais largo' }, ['hold'], { wide: true }),
  R('lateral-inv', 'Lateral invertido', 'LI', ['De'], ['Passe', 'Decisões', 'Posicionamento', 'Técnica'], 'Com bola, fecha para dentro e junta-se aos médios.', { width: 'Mais estreito', cross: 'Menos' }, ['hold', 'cross', 'crossFrom', 'crossTarget', 'width'], { inside: true }),
  R('lateral-def', 'Lateral sem rodeios', 'LS', ['De'], ['Desarme', 'Posicionamento', 'Força', 'Trabalho de equipa'], 'Fica atrás e fecha o corredor.', { runs: 'Menos', freedom: 'Fixo' }, ['hold', 'shoot', 'dribble', 'freedom'])
];
const WB = [
  R('ala', 'Ala', 'AL', ['De', 'Ap', 'At'], ['Resistência', 'Aceleração', 'Passe', 'Desarme'], 'Ocupa o corredor inteiro, de área a área.', { width: 'Mais largo' }, ['hold'], { wide: true }),
  R('ala-comp', 'Ala completo', 'ALC', ['Ap', 'At'], ['Drible', 'Aceleração', 'Passe', 'Técnica'], 'Joga quase como extremo: largura, drible e cruzamento.', { width: 'Mais largo', cross: 'Mais', dribble: 'Mais' }, ['hold'], { wide: true }),
  R('ala-inv', 'Ala invertido', 'ALI', ['De', 'Ap', 'At'], ['Passe', 'Técnica', 'Decisões', 'Resistência'], 'Entra por dentro para criar superioridade no meio.', { width: 'Mais estreito' }, ['hold', 'crossFrom'], { inside: true })
];
const DM = [
  R('trinco', 'Trinco', 'TR', ['De'], ['Posicionamento', 'Desarme', 'Decisões', 'Trabalho de equipa'], 'Fica à frente dos centrais e corta linhas de passe.', { runs: 'Menos', freedom: 'Fixo' }, ['runs', 'cross', 'crossFrom', 'crossTarget', 'width', 'freedom', 'hold']),
  R('medio-def', 'Médio defensivo', 'MD', ['De', 'Ap'], ['Desarme', 'Posicionamento', 'Trabalho de equipa', 'Resistência'], 'Protege a defesa e dá apoio curto.', { runs: 'Menos' }, ['cross', 'crossFrom', 'crossTarget', 'width']),
  R('org-recuado', 'Organizador recuado', 'OR', ['De', 'Ap'], ['Passe', 'Decisões', 'Técnica', 'Posicionamento'], 'Recebe entre centrais e distribui.', { passRisk: 'Arriscado' }, ['cross', 'crossFrom', 'crossTarget', 'width'], { playmaker: true }),
  R('regista', 'Regista', 'RG', ['Ap'], ['Passe', 'Técnica', 'Decisões', 'Drible'], 'Organizador livre a partir de trás: tudo passa por ele.', { passRisk: 'Arriscado', freedom: 'Livre' }, ['cross', 'crossFrom', 'crossTarget', 'width', 'passRisk', 'freedom'], { playmaker: true }),
  R('volante', 'Volante', 'VO', ['Ap', 'At'], ['Resistência', 'Trabalho de equipa', 'Finalização', 'Desarme'], 'Começa atrás e aparece na área em corrida.', { runs: 'Mais' }, ['cross', 'crossFrom', 'crossTarget', 'width']),
  R('recuperador', 'Médio recuperador', 'MR', ['De', 'Ap'], ['Desarme', 'Resistência', 'Força', 'Trabalho de equipa'], 'Caça a bola e pressiona sem descanso.', { press: 'Mais', tackle: 'Agressivo' }, ['cross', 'crossFrom', 'crossTarget', 'width', 'press', 'tackle'])
];
const CM = [
  R('medio-centro', 'Médio centro', 'MC', ['De', 'Ap', 'At'], ['Passe', 'Trabalho de equipa', 'Decisões', 'Desarme'], 'Faz um pouco de tudo, conforme o dever.', {}, ['width', 'crossFrom']),
  R('box', 'Box-to-box', 'BB', ['Ap'], ['Resistência', 'Trabalho de equipa', 'Passe', 'Desarme'], 'Liga as duas áreas: recupera e aparece na finalização.', { runs: 'Mais' }, ['width', 'runs', 'crossFrom']),
  R('mezzala', 'Mezzala', 'MZ', ['Ap', 'At'], ['Passe', 'Drible', 'Técnica', 'Decisões'], 'Sai do meio para o meio-espaço e ataca a área por fora do ponta.', { width: 'Mais largo', dribble: 'Mais' }, ['width', 'crossFrom']),
  R('carrilero', 'Carrilero', 'CR', ['Ap'], ['Trabalho de equipa', 'Resistência', 'Passe', 'Posicionamento'], 'Cobre o corredor lateral e a ala que sobe.', { freedom: 'Fixo', passRisk: 'Seguro' }, ['width', 'freedom', 'dribble', 'crossFrom']),
  R('org-avancado', 'Organizador avançado', 'OA', ['Ap', 'At'], ['Passe', 'Técnica', 'Decisões', 'Drible'], 'Procura o espaço entre linhas para o último passe.', { passRisk: 'Arriscado', freedom: 'Livre' }, ['width', 'crossFrom'], { playmaker: true }),
  R('recuperador-mc', 'Médio recuperador', 'MR', ['De', 'Ap'], ['Desarme', 'Resistência', 'Força', 'Trabalho de equipa'], 'Caça a bola e pressiona sem descanso.', { press: 'Mais', tackle: 'Agressivo' }, ['width', 'press', 'tackle', 'crossFrom'])
];
const WM = [
  R('medio-ala', 'Médio-ala', 'MA', ['De', 'Ap', 'At'], ['Resistência', 'Trabalho de equipa', 'Passe', 'Desarme'], 'Defende o corredor e dá largura com bola.', { width: 'Mais largo' }, [], { wide: true }),
  R('ala-defensivo', 'Ala defensivo', 'AD', ['De', 'Ap'], ['Trabalho de equipa', 'Resistência', 'Desarme', 'Posicionamento'], 'Recua até à linha defensiva sem bola.', { press: 'Mais' }, ['hold'], { wide: true }),
  R('ala-interior', 'Ala interior', 'AI', ['Ap', 'At'], ['Técnica', 'Passe', 'Finalização', 'Decisões'], 'Fecha para dentro e procura a área.', { width: 'Mais estreito', shoot: 'Mais' }, ['crossFrom'], { inside: true }),
  R('extremo-m', 'Extremo', 'EX', ['Ap', 'At'], ['Aceleração', 'Drible', 'Técnica', 'Passe'], 'Abre o campo, encara o lateral e cruza.', { width: 'Mais largo', cross: 'Mais', dribble: 'Mais' }, [], { wide: true }),
  R('org-aberto', 'Organizador aberto', 'OAb', ['Ap', 'At'], ['Passe', 'Técnica', 'Decisões', 'Drible'], 'Recebe aberto e cria a partir da ala.', { passRisk: 'Arriscado' }, [], { playmaker: true, wide: true })
];
const AM = [
  R('mco', 'Médio ofensivo', 'MO', ['Ap', 'At'], ['Passe', 'Técnica', 'Finalização', 'Decisões'], 'Joga entre linhas e chega à área.', {}, ['width', 'crossFrom']),
  R('n10', 'Número 10', 'N10', ['At'], ['Técnica', 'Drible', 'Passe', 'Finalização'], 'Livre para aparecer onde o jogo pede. Pouco trabalho sem bola.', { freedom: 'Livre', passRisk: 'Arriscado', press: 'Menos' }, ['width', 'freedom', 'crossFrom', 'press', 'track'], { playmaker: true }),
  R('enganche', 'Enganche', 'EN', ['Ap'], ['Passe', 'Técnica', 'Decisões', 'Posicionamento'], 'Fica parado entre linhas como ponto de apoio e lança.', { freedom: 'Fixo', runs: 'Menos', passRisk: 'Arriscado' }, ['width', 'freedom', 'runs', 'crossFrom'], { playmaker: true }),
  R('sombra', 'Avançado sombra', 'AS', ['At'], ['Finalização', 'Aceleração', 'Posicionamento', 'Técnica'], 'Ataca a área por trás do ponta de lança.', { runs: 'Mais', shoot: 'Mais' }, ['width', 'runs', 'crossFrom'])
];
const W = [
  R('extremo', 'Extremo', 'EX', ['Ap', 'At'], ['Aceleração', 'Drible', 'Técnica', 'Passe'], 'Abre o campo, encara o lateral e cruza.', { width: 'Mais largo', cross: 'Mais', dribble: 'Mais' }, [], { wide: true }),
  R('extremo-inv', 'Extremo invertido', 'EI', ['Ap', 'At'], ['Drible', 'Técnica', 'Passe', 'Aceleração'], 'Entra em diagonal para o pé forte e cria.', { width: 'Mais estreito', dribble: 'Mais' }, ['crossFrom'], { inside: true }),
  R('av-interior', 'Avançado interior', 'AIn', ['Ap', 'At'], ['Finalização', 'Drible', 'Aceleração', 'Técnica'], 'Corta para dentro e ataca a baliza.', { width: 'Mais estreito', shoot: 'Mais', runs: 'Mais' }, ['crossFrom', 'cross'], { inside: true }),
  R('raumdeuter', 'Caçador de espaços', 'CE', ['At'], ['Posicionamento', 'Finalização', 'Decisões', 'Aceleração'], 'Desaparece do jogo para surgir no espaço certo na área.', { runs: 'Mais', freedom: 'Livre' }, ['freedom', 'runs', 'dribble', 'cross', 'crossFrom', 'crossTarget', 'hold'], { inside: true }),
  R('org-aberto-w', 'Organizador aberto', 'OAb', ['Ap', 'At'], ['Passe', 'Técnica', 'Decisões', 'Drible'], 'Recebe aberto e cria a partir da ala.', { passRisk: 'Arriscado' }, [], { playmaker: true, wide: true })
];
const ST = [
  R('pl', 'Ponta de lança', 'PL', ['At'], ['Finalização', 'Aceleração', 'Posicionamento', 'Técnica'], 'Ataca a profundidade e finaliza.', { runs: 'Mais', shoot: 'Mais' }, ['width', 'cross', 'crossFrom', 'crossTarget', 'runs']),
  R('pressao', 'Avançado de pressão', 'AP', ['De', 'Ap', 'At'], ['Trabalho de equipa', 'Resistência', 'Aceleração', 'Desarme'], 'Primeiro defensor: fecha o passe para o pivô e persegue os centrais.', { press: 'Mais', closePass: 'Sim' }, ['width', 'cross', 'crossFrom', 'crossTarget', 'press']),
  R('alvo', 'Homem-alvo', 'HA', ['Ap', 'At'], ['Força', 'Cabeceamento', 'Técnica', 'Trabalho de equipa'], 'Segura a bola de costas e liga o jogo.', { hold: 'Sim', runs: 'Menos' }, ['width', 'cross', 'crossFrom', 'crossTarget', 'hold']),
  R('falso9', 'Falso 9', 'F9', ['Ap'], ['Passe', 'Técnica', 'Decisões', 'Drible'], 'Recua para criar superioridade no meio e abrir espaço às alas.', { freedom: 'Livre', runs: 'Menos', passRisk: 'Arriscado' }, ['width', 'cross', 'crossFrom', 'crossTarget', 'runs', 'freedom'], { playmaker: true }),
  R('av-completo', 'Avançado completo', 'AC', ['Ap', 'At'], ['Finalização', 'Técnica', 'Força', 'Passe'], 'Faz tudo: segura, cria e finaliza.', {}, ['width', 'crossFrom']),
  R('finalizador', 'Finalizador', 'FN', ['At'], ['Finalização', 'Posicionamento', 'Aceleração', 'Decisões'], 'Vive na área: um toque, um golo.', { runs: 'Mais', shoot: 'Mais', press: 'Menos' }, ['width', 'cross', 'crossFrom', 'crossTarget', 'hold', 'dribble', 'runs']),
  R('av-recuado', 'Avançado recuado', 'AR', ['Ap', 'At'], ['Passe', 'Técnica', 'Decisões', 'Força'], 'Baixa para receber e liga com os médios.', { runs: 'Menos' }, ['width', 'cross', 'crossFrom', 'crossTarget'])
];
export const ROLES: Record<string, Role[]> = {
  GR: GK, DC: CB, DE: FB, DD: FB, ALE: WB, ALD: WB, MDC: DM, MC: CM, ME: WM, MD: WM, MCO: AM, EE: W, ED: W, PL: ST
};

// ---------------------------------------------------------------------------
/** Instruções (cartões). `glyph` escolhe o desenho; `hint` aparece no seletor. */
export type Instr = { key: string; label: string; glyph: string; options: string[]; def: string; hint?: string };
const I = (key: string, label: string, glyph: string, options: string[], def: string, hint?: string): Instr => ({ key, label, glyph, options, def, hint });

export const PLAYER_INSTR: Record<'posse' | 'sem' | 'trans', Instr[]> = {
  posse: [
    I('width', 'Largura', 'width', ['Mais estreito', 'Normal', 'Mais largo'], 'Normal', 'Onde se posiciona quando a equipa tem a bola.'),
    I('runs', 'Corridas em profundidade', 'runs', ['Menos', 'Normal', 'Mais'], 'Normal', 'Com que frequência ataca o espaço nas costas da defesa.'),
    I('freedom', 'Liberdade de movimento', 'freedom', ['Fixo', 'Segue a tática', 'Livre'], 'Segue a tática', 'Quanto pode sair da sua zona.'),
    I('hold', 'Segurar a bola', 'hold', ['Não', 'Sim'], 'Não', 'Proteger a bola à espera de apoio.'),
    I('dribble', 'Frequência de drible', 'dribble', ['Menos', 'Normal', 'Mais'], 'Normal'),
    I('shoot', 'Remate', 'shoot', ['Menos', 'Normal', 'Mais'], 'Normal', 'Remata de longe ou procura um passe melhor.'),
    I('passRisk', 'Risco de passe', 'pass', ['Seguro', 'Normal', 'Arriscado'], 'Normal'),
    I('cross', 'Cruzamentos', 'cross', ['Menos', 'Normal', 'Mais'], 'Normal'),
    I('crossFrom', 'Cruzar de', 'crossfrom', ['Linha de fundo', 'Misto', 'Zona recuada'], 'Misto'),
    I('crossTarget', 'Alvo do cruzamento', 'target', ['1.º poste', 'Centro', '2.º poste', 'Misto'], 'Misto')
  ],
  sem: [
    I('press', 'Pressão', 'press', ['Menos', 'Normal', 'Mais'], 'Normal'),
    I('closePass', 'Fechar linha de passe', 'close', ['Não', 'Sim'], 'Não', 'Ficar na linha entre o portador e o pivô.'),
    I('mark', 'Marcação', 'mark', ['À zona', 'Individual'], 'À zona'),
    I('tackle', 'Desarme', 'tackle', ['Cuidadoso', 'Normal', 'Agressivo'], 'Normal'),
    I('track', 'Acompanhar o adversário', 'track', ['Não', 'Sim'], 'Sim', 'Segue as desmarcações até ao fim.'),
    I('showOnto', 'Orientar o adversário', 'showonto', ['Neutro', 'Para o pé fraco', 'Para dentro', 'Para fora'], 'Neutro')
  ],
  trans: [
    I('tRun', 'Ao ganhar a bola', 'counter', ['Ficar', 'Apoiar', 'Atacar a profundidade'], 'Apoiar', 'O primeiro movimento depois da recuperação.'),
    I('tBack', 'Ao perder a bola', 'regroup', ['Recuar', 'Fechar o meio', 'Contrapressão'], 'Fechar o meio', 'O primeiro movimento depois da perda.')
  ]
};

/** Instruções de equipa por momento (como no FM: com bola, transição, sem bola). */
export const TEAM_INSTR: Record<'ataque' | 'defesa' | 'transof' | 'transdef', Instr[]> = {
  ataque: [
    I('tWidth', 'Largura do ataque', 'width', ['Muito estreita', 'Estreita', 'Normal', 'Larga', 'Muito larga'], 'Normal'),
    I('tempo', 'Ritmo', 'tempo', ['Muito lento', 'Lento', 'Normal', 'Rápido', 'Muito rápido'], 'Normal'),
    I('tPass', 'Tipo de passe', 'pass', ['Muito curto', 'Curto', 'Misto', 'Direto', 'Muito direto'], 'Misto'),
    I('buildUp', 'Construção', 'build', ['Sair a jogar', 'Equilibrada', 'Bola longa nos avançados'], 'Equilibrada'),
    I('attackZone', 'Corredor preferido', 'zone', ['Pela esquerda', 'Equilibrado', 'Pelo meio', 'Pela direita'], 'Equilibrado'),
    I('finalThird', 'Último terço', 'box', ['Trabalhar até à área', 'Equilibrado', 'Rematar à vista'], 'Equilibrado'),
    I('crossType', 'Tipo de cruzamento', 'cross', ['Rasteiro', 'Misto', 'Tenso', 'Alto'], 'Misto'),
    I('creative', 'Liberdade criativa', 'freedom', ['Disciplinada', 'Equilibrada', 'Expressiva'], 'Equilibrada'),
    I('tDribble', 'Drible', 'dribble', ['Menos', 'Normal', 'Mais'], 'Normal'),
    I('timeWaste', 'Queimar tempo', 'clock', ['Nunca', 'Às vezes', 'Muitas vezes'], 'Nunca')
  ],
  transof: [
    I('won', 'Ao ganhar a bola', 'counter', ['Manter a posse', 'Equilibrado', 'Contra-ataque'], 'Equilibrado'),
    I('counterRoute', 'Rota do contra-ataque', 'zone', ['Pela esquerda', 'Pelo meio', 'Pela direita', 'Pelo jogador livre'], 'Pelo jogador livre'),
    I('gkDist', 'Reposição do GR', 'gk', ['Abrandar', 'Normal', 'Rápida'], 'Normal'),
    I('gkTarget', 'GR distribui para', 'gktarget', ['Centrais', 'Laterais', 'Médios', 'Avançados', 'Livre'], 'Livre'),
    I('gkType', 'Tipo de reposição', 'gk', ['Mão', 'Pontapé curto', 'Pontapé longo', 'Mista'], 'Mista')
  ],
  transdef: [
    I('lost', 'Ao perder a bola', 'regroup', ['Reagrupar', 'Equilibrado', 'Contrapressão'], 'Equilibrado'),
    I('cpTime', 'Duração da contrapressão', 'clock', ['Curta (3 s)', 'Normal (5 s)', 'Longa (8 s)'], 'Normal (5 s)'),
    I('recovery', 'Linha ao perder', 'line', ['Recua logo', 'Mantém altura'], 'Recua logo'),
    I('tacticalFoul', 'Faltas táticas', 'tackle', ['Não', 'Sim'], 'Não', 'Parar o contra-ataque com falta.')
  ],
  defesa: [
    I('block', 'Linha de pressão', 'block', ['Baixa', 'Média', 'Alta'], 'Média', 'Onde a equipa começa a pressionar.'),
    I('line', 'Linha defensiva', 'line', ['Muito recuada', 'Recuada', 'Normal', 'Subida', 'Muito subida'], 'Normal'),
    I('intensity', 'Intensidade da pressão', 'press', ['Muito baixa', 'Baixa', 'Normal', 'Alta', 'Muito alta'], 'Normal'),
    I('trigger', 'Gatilho de pressão', 'trigger', ['Sempre', 'Bola na ala', 'Passe atrasado', 'Receção de costas'], 'Sempre'),
    I('compact', 'Largura defensiva', 'compact', ['Estreita', 'Normal', 'Larga'], 'Normal'),
    I('funnel', 'Encaminhar o adversário', 'funnel', ['Para dentro', 'Equilibrado', 'Para fora'], 'Equilibrado'),
    I('tTackle', 'Desarmes', 'tackle', ['Ficar de pé', 'Normal', 'Agressivos'], 'Normal'),
    I('offside', 'Armadilha do fora de jogo', 'offside', ['Não', 'Sim'], 'Não'),
    I('stopGK', 'Impedir saída curta do GR', 'gk', ['Não', 'Sim'], 'Não'),
    I('stopCross', 'Impedir cruzamentos', 'cross', ['Não', 'Sim'], 'Não')
  ]
};

export const MENTALITIES = ['Muito defensiva', 'Defensiva', 'Cautelosa', 'Equilibrada', 'Positiva', 'Ofensiva', 'Muito ofensiva'];

/** Estilos táticos predefinidos: mudam mentalidade e instruções de equipa. */
export const STYLES: { key: string; name: string; desc: string; mentality: string; team: Record<string, Record<string, string>> }[] = [
  {
    key: 'bubista', name: 'Bloco médio e faca', desc: 'Duas linhas juntas, pressão com gatilho e saída rápida.', mentality: 'Equilibrada',
    team: {
      ataque: { tWidth: 'Normal', tempo: 'Rápido', tPass: 'Direto', buildUp: 'Equilibrada', attackZone: 'Equilibrado', finalThird: 'Equilibrado' },
      transof: { won: 'Contra-ataque', gkDist: 'Rápida', counterRoute: 'Pelo jogador livre' },
      transdef: { lost: 'Reagrupar', recovery: 'Recua logo' },
      defesa: { block: 'Média', line: 'Normal', intensity: 'Normal', trigger: 'Bola na ala', compact: 'Estreita', funnel: 'Para fora' }
    }
  },
  {
    key: 'contrapressao', name: 'Contrapressão', desc: 'Recuperar a bola nos 5 segundos depois de a perder.', mentality: 'Positiva',
    team: {
      ataque: { tWidth: 'Normal', tempo: 'Rápido', tPass: 'Direto', buildUp: 'Equilibrada', finalThird: 'Equilibrado' },
      transof: { won: 'Contra-ataque', gkDist: 'Rápida' },
      transdef: { lost: 'Contrapressão', cpTime: 'Normal (5 s)', recovery: 'Mantém altura' },
      defesa: { block: 'Alta', line: 'Subida', intensity: 'Muito alta', trigger: 'Sempre', compact: 'Estreita', tTackle: 'Agressivos' }
    }
  },
  {
    key: 'controlo', name: 'Posse de controlo', desc: 'Passe curto, paciência e a bola como defesa.', mentality: 'Positiva',
    team: {
      ataque: { tWidth: 'Larga', tempo: 'Lento', tPass: 'Muito curto', buildUp: 'Sair a jogar', finalThird: 'Trabalhar até à área', creative: 'Expressiva' },
      transof: { won: 'Manter a posse', gkDist: 'Abrandar', gkTarget: 'Centrais', gkType: 'Pontapé curto' },
      transdef: { lost: 'Contrapressão', cpTime: 'Curta (3 s)' },
      defesa: { block: 'Alta', line: 'Subida', intensity: 'Alta', trigger: 'Sempre' }
    }
  },
  {
    key: 'direto', name: 'Contra-ataque direto', desc: 'Defender baixo e atacar o espaço com poucos passes.', mentality: 'Cautelosa',
    team: {
      ataque: { tWidth: 'Larga', tempo: 'Muito rápido', tPass: 'Muito direto', buildUp: 'Bola longa nos avançados', finalThird: 'Rematar à vista' },
      transof: { won: 'Contra-ataque', gkDist: 'Rápida', gkType: 'Pontapé longo', gkTarget: 'Avançados' },
      transdef: { lost: 'Reagrupar', recovery: 'Recua logo' },
      defesa: { block: 'Baixa', line: 'Recuada', intensity: 'Baixa', compact: 'Estreita' }
    }
  },
  {
    key: 'autocarro', name: 'Bloco baixo', desc: 'Fechar a área e viver da bola parada.', mentality: 'Muito defensiva',
    team: {
      ataque: { tWidth: 'Estreita', tempo: 'Lento', tPass: 'Direto', buildUp: 'Bola longa nos avançados', timeWaste: 'Muitas vezes' },
      transof: { won: 'Manter a posse', gkDist: 'Abrandar' },
      transdef: { lost: 'Reagrupar', tacticalFoul: 'Sim' },
      defesa: { block: 'Baixa', line: 'Muito recuada', intensity: 'Baixa', compact: 'Estreita', funnel: 'Para fora', stopCross: 'Sim' }
    }
  }
];

// ---------------------------------------------------------------------------
// Bola parada
export const SP_ROUTINES = [
  { key: 'cantoOf', label: 'Canto ofensivo' },
  { key: 'livreOf', label: 'Livre lateral' },
  { key: 'cantoDef', label: 'Canto defensivo' }
] as const;
export type SPKey = (typeof SP_ROUTINES)[number]['key'];
export const SP_ATTACK_JOBS = ['Atacar o 1.º poste', 'Atacar o centro', 'Atacar o 2.º poste', 'Tapar o guarda-redes', 'Entrada da área', 'Opção curta', 'Ficar atrás'];
export const SP_DEFEND_JOBS = ['Zona — pequena área', 'Zona — marca de penálti', 'Marcação individual', 'Ao 1.º poste', 'Ao 2.º poste', 'Entrada da área', 'Ficar na frente'];
export const SP_DELIVERY = ['1.º poste', 'Centro', '2.º poste', 'Entrada da área', 'Curto', 'Misto'];
export const SP_DELIVERY_FK = ['Remate direto', '1.º poste', 'Centro', '2.º poste', 'Curto'];
export const SP_SYSTEM = ['À zona', 'Individual', 'Misto'];
export const SP_SIDES = ['Esquerda', 'Direita'];

// ---------------------------------------------------------------------------
export function roleOf(code: string, key: string | undefined): Role {
  const list = ROLES[code] || ST;
  return list.find((r) => r.key === key) || list[0];
}
export function dutyOf(role: Role, duty: string | undefined): Duty {
  return (role.duties.includes(duty as Duty) ? duty : role.duties[Math.min(1, role.duties.length - 1)]) as Duty;
}
/** Padrões que o dever acrescenta (como o FM: o dever muda corridas, pressão e transições). */
function dutyDefaults(d: Duty): Record<string, string> {
  if (d === 'De') return { runs: 'Menos', tRun: 'Ficar', tBack: 'Recuar' };
  if (d === 'At') return { runs: 'Mais', tRun: 'Atacar a profundidade', tBack: 'Contrapressão' };
  return { tRun: 'Apoiar', tBack: 'Fechar o meio' };
}
export function roleDefaults(role: Role, duty: Duty): Record<string, string> {
  return { ...dutyDefaults(duty), ...role.defaults };
}

/** Valor efetivo de uma instrução (escolha > padrão da função/dever > padrão da instrução). */
export function instrValue(ins: Instr, role: Role, duty: Duty, chosen: Record<string, string> | undefined) {
  const locked = !!role.locked?.includes(ins.key);
  const rd = roleDefaults(role, duty)[ins.key];
  const roleDef = rd && ins.options.includes(rd) ? rd : ins.def;
  if (locked) return { value: roleDef, locked: true, tweaked: false };
  const v = chosen?.[ins.key];
  const value = v && ins.options.includes(v) ? v : roleDef;
  return { value, locked: false, tweaked: value !== roleDef };
}
export function teamValue(ins: Instr, chosen: Record<string, string> | undefined) {
  const v = chosen?.[ins.key];
  return v && ins.options.includes(v) ? v : ins.def;
}

/** Adequação de um jogador a uma posição: 4 níveis, como o círculo do FM. */
export type Fit = { level: 0 | 1 | 2 | 3; label: string; f: number };
const FITS: Fit[] = [
  { level: 0, label: 'Desajustado', f: 0.45 }, { level: 1, label: 'Pouco convincente', f: 0.7 },
  { level: 2, label: 'Competente', f: 0.88 }, { level: 3, label: 'Natural', f: 1 }
];
export function positionsOf(p: any): string[] {
  if (Array.isArray(p?.positions) && p.positions.length) return p.positions;
  return ({ gr: ['GR'], def: ['DC'], med: ['MC'], av: ['PL'] } as any)[p?.pos] || [];
}
export function fitOf(p: any, code: string): Fit {
  const ps = positionsOf(p);
  if (!p) return FITS[0];
  if (ps.includes(code)) return FITS[3];
  if (code === 'GR' || ps.includes('GR')) return FITS[0];
  if (ps.some((c) => NEAR[c]?.includes(code))) return FITS[2];
  if (ps.some((c) => GROUP[c] === GROUP[code])) return FITS[1];
  return FITS[0];
}
export function attrNum(p: any, a: string): number | null {
  const v = parseFloat(String(p?.attrs?.[a] ?? ''));
  return isFinite(v) ? Math.max(1, Math.min(20, v)) : null;
}
/** Capacidade na função (0–5 estrelas, em meios): média dos atributos-chave × adequação. */
export function roleAbility(p: any, role: Role, code: string): number | null {
  const vals = role.keys.map((k) => attrNum(p, k)).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.max(0.5, Math.round(((avg / 20) * 5 * fitOf(p, code).f) * 2) / 2);
}

// ---------------------------------------------------------------------------
// Estado da tática
export type PlayerT = { pid: string; role?: string; duty?: string; apply?: 'posicao' | 'jogador'; posse?: Record<string, string>; sem?: Record<string, string>; trans?: Record<string, string>; name?: string; ini?: string };
export type Tactic = {
  name: string; style: string; mentality: string; formation: string;
  team: Record<'ataque' | 'defesa' | 'transof' | 'transdef', Record<string, string>>;
  players: PlayerT[];
  bench: string[];
  setPieces: Record<string, any>;
};

/** Converte dados antigos (posse/transicao/sem) para o modelo dos 5 momentos e completa o que falta. */
export function normalize(raw: any, squad: any[]): Tactic {
  const t = raw || {};
  const team = t.team || {};
  const formation = FORMATIONS[t.formation] ? t.formation : '4-4-2';
  const players: PlayerT[] = (t.players || []).slice(0, 11).map((p: any) => ({
    pid: p.pid || '', role: p.role, duty: p.duty, apply: p.apply === 'jogador' ? 'jogador' : 'posicao',
    posse: { ...(p.posse || {}) }, sem: { ...(p.sem || {}) }, trans: { ...(p.trans || {}) }, name: p.name, ini: p.ini
  }));
  const used = new Set(players.map((p) => p.pid));
  for (const s of squad) { if (players.length >= 11) break; if (!used.has(s.id)) { players.push({ pid: s.id, apply: 'posicao', posse: {}, sem: {}, trans: {} }); used.add(s.id); } }
  while (players.length < 11) players.push({ pid: '', apply: 'posicao', posse: {}, sem: {}, trans: {} });
  const bench: string[] = Array.isArray(t.bench) ? t.bench.filter((id: string) => !used.has(id) && squad.some((s) => s.id === id)) : [];
  for (const s of squad) if (!used.has(s.id) && !bench.includes(s.id)) bench.push(s.id);
  const sp = t.setPieces || {};
  return {
    name: t.name || 'Plano', style: t.style || 'custom', mentality: MENTALITIES.includes(t.mentality) ? t.mentality : 'Equilibrada', formation,
    team: {
      ataque: { ...(team.posse || {}), ...(team.ataque || {}) },
      defesa: { ...(team.sem || {}), ...(team.defesa || {}) },
      transof: { ...(team.transicao ? { won: team.transicao.won, gkDist: team.transicao.gkDist === 'Lenta' ? 'Abrandar' : team.transicao.gkDist } : {}), ...(team.transof || {}) },
      transdef: { ...(team.transicao ? { lost: team.transicao.lost } : {}), ...(team.transdef || {}) }
    },
    players, bench: bench.slice(0, 12),
    setPieces: {
      cantoOf: { side: 'Direita', delivery: '1.º poste', taker: '', jobs: {}, ...(sp.cantoOf || {}) },
      livreOf: { side: 'Esquerda', delivery: '2.º poste', taker: '', jobs: {}, ...(sp.livreOf || {}) },
      cantoDef: { side: 'Direita', system: 'Misto', jobs: {}, ...(sp.cantoDef || {}) }
    }
  };
}

/** Função e dever efetivos de um lugar. */
export function slotRole(t: Tactic, i: number) {
  const slot = FORMATIONS[t.formation][i];
  const p = t.players[i] || ({} as PlayerT);
  const role = roleOf(slot.code, p.role);
  const duty = dutyOf(role, p.duty);
  return { slot, p, role, duty };
}
export function effective(t: Tactic, i: number, group: 'posse' | 'sem' | 'trans', key: string): string {
  const { p, role, duty } = slotRole(t, i);
  const ins = PLAYER_INSTR[group].find((x) => x.key === key)!;
  return instrValue(ins, role, duty, p[group]).value;
}

const lvl = (opts: string[], v: string) => { const i = opts.indexOf(v); return opts.length > 1 ? (i < 0 ? 0.5 : i / (opts.length - 1)) : 0.5; };
const tv = (t: Tactic, m: 'ataque' | 'defesa' | 'transof' | 'transdef', key: string) => teamValue(TEAM_INSTR[m].find((x) => x.key === key)!, t.team[m]);
const tl = (t: Tactic, m: 'ataque' | 'defesa' | 'transof' | 'transdef', key: string) => lvl(TEAM_INSTR[m].find((x) => x.key === key)!.options, tv(t, m, key));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ment = (t: Tactic) => MENTALITIES.indexOf(t.mentality) - 3; // -3..3

/** Posição de cada jogador em cada momento (campo vertical, ataque para cima). */
export function positionFor(t: Tactic, i: number, m: MomentKey): [number, number] {
  const { slot, role, duty } = slotRole(t, i);
  const { code, x, y } = slot;
  const mm = ment(t);
  const gr = code === 'GR';
  const def = GROUP[code] === 'def';
  const side = x < 45 ? -1 : x > 55 ? 1 : 0;
  const atk = (): [number, number] => {
    if (gr) return [x, role.key === 'gr-libero' ? y - 8 : y - 2];
    const w = 0.78 + tl(t, 'ataque', 'tWidth') * 0.5;
    let nx = 50 + (x - 50) * w;
    let ny = y - 11 - mm * 1.6;
    ny += duty === 'At' ? -7 : duty === 'De' ? 4 : -1;
    const runs = effective(t, i, 'posse', 'runs');
    ny += runs === 'Mais' ? -4 : runs === 'Menos' ? 3 : 0;
    const pw = effective(t, i, 'posse', 'width');
    if (side) nx += side * (pw === 'Mais largo' ? 7 : pw === 'Mais estreito' ? -9 : 0);
    if (role.inside && side) { nx -= side * 10; ny -= 3; }
    if (role.key === 'lateral-inv' && side) { nx = 50 + side * 18; ny = 50 - mm; }
    if (role.key === 'falso9' || role.key === 'av-recuado') ny += 11;
    if (role.key === 'central-constr') ny -= 5;
    if (role.key === 'enganche') ny += 3;
    if (def && duty === 'De' && role.key !== 'lateral-inv') ny += 6;
    const zone = tv(t, 'ataque', 'attackZone');
    nx += zone === 'Pela esquerda' ? -4 : zone === 'Pela direita' ? 4 : 0;
    if (zone === 'Pelo meio' && side) nx -= side * 4;
    return [nx, ny];
  };
  const dfn = (): [number, number] => {
    if (gr) return [x, y];
    const block = tv(t, 'defesa', 'block');
    const shift = block === 'Alta' ? -11 : block === 'Baixa' ? 9 : 1;
    const line = tl(t, 'defesa', 'line');
    const comp = tv(t, 'defesa', 'compact');
    const squeeze = 0.78 + line * 0.06 + (comp === 'Larga' ? 0.1 : 0);
    let nx = 50 + (x - 50) * (comp === 'Estreita' ? 0.8 : comp === 'Larga' ? 0.98 : 0.88);
    let ny = 56 + (y - 56) * squeeze + shift + mm * 1.2;
    if (def) ny += (0.5 - line) * 10;
    if (GROUP[code] === 'av' || code === 'MCO') ny -= duty === 'At' ? 5 : duty === 'De' ? -4 : 0;
    if (role.key === 'ala-defensivo' || (code.startsWith('AL') && duty === 'De')) ny += 6;
    const pr = effective(t, i, 'sem', 'press');
    ny += pr === 'Mais' ? -3 : pr === 'Menos' ? 2 : 0;
    return [nx, ny];
  };
  let p: [number, number];
  if (m === 'ataque') p = atk();
  else if (m === 'defesa') p = dfn();
  else if (m === 'transof') {
    const [dx, dy] = dfn();
    if (gr) p = [dx, dy];
    else {
      const won = tv(t, 'transof', 'won');
      const k = won === 'Contra-ataque' ? 1.25 : won === 'Manter a posse' ? 0.55 : 0.9;
      const run = effective(t, i, 'trans', 'tRun');
      const dist = run === 'Atacar a profundidade' ? 24 : run === 'Apoiar' ? 11 : 2;
      const route = tv(t, 'transof', 'counterRoute');
      const pull = route === 'Pela esquerda' ? -6 : route === 'Pela direita' ? 6 : route === 'Pelo meio' ? (50 - dx) * 0.15 : 0;
      p = [dx + (run === 'Atacar a profundidade' ? pull + side * 4 : pull * 0.5), dy - dist * k];
    }
  } else {
    const [ax, ay] = atk();
    if (gr) p = [x, y];
    else {
      const lost = tv(t, 'transdef', 'lost');
      const back = effective(t, i, 'trans', 'tBack');
      const team = lost === 'Contrapressão' ? -1 : lost === 'Reagrupar' ? 1 : 0;
      let nx = ax, ny = ay;
      if (back === 'Contrapressão' && team <= 0) { nx = ax + (48 - ax) * 0.35; ny = ay - 2; }
      else if (back === 'Fechar o meio' || (back === 'Contrapressão' && team > 0)) { nx = ax + (50 - ax) * 0.3; ny = ay + 10 + team * 4; }
      else { nx = ax + (50 - ax) * 0.15; ny = ay + 20 + team * 4; }
      if (def && tv(t, 'transdef', 'recovery') === 'Recua logo') ny += 5;
      p = [nx, ny];
    }
  }
  return [clamp(p[0], 4, 96), clamp(p[1], 5, 95)];
}

/** Onde está a bola no desenho de cada momento. */
export function ballFor(t: Tactic, m: MomentKey): [number, number] | null {
  if (m === 'ataque') { const z = tv(t, 'ataque', 'attackZone'); return [z === 'Pela esquerda' ? 18 : z === 'Pela direita' ? 82 : 50, 30]; }
  if (m === 'defesa') { const tr = tv(t, 'defesa', 'trigger'); return tr === 'Bola na ala' ? [88, 42] : [50, 22]; }
  if (m === 'transof') return [46, 58];
  if (m === 'transdef') return [52, 34];
  return null;
}

// ---------------------------------------------------------------------------
// Bola parada: posições dos jogadores consoante a tarefa.
const JOB_SPOT_ATK: Record<string, [number, number]> = {
  'Atacar o 1.º poste': [58, 8], 'Atacar o centro': [50, 11], 'Atacar o 2.º poste': [40, 9], 'Tapar o guarda-redes': [50, 4],
  'Entrada da área': [50, 23], 'Opção curta': [86, 8], 'Ficar atrás': [50, 48]
};
const JOB_SPOT_DEF: Record<string, [number, number]> = {
  'Zona — pequena área': [50, 92], 'Zona — marca de penálti': [50, 86], 'Marcação individual': [50, 88], 'Ao 1.º poste': [57, 96],
  'Ao 2.º poste': [43, 96], 'Entrada da área': [50, 77], 'Ficar na frente': [50, 55]
};
export function defaultJob(code: string, routine: SPKey, idx: number): string {
  if (routine === 'cantoDef') {
    if (code === 'GR') return '';
    if (GROUP[code] === 'av') return idx % 2 ? 'Ficar na frente' : 'Entrada da área';
    if (code === 'DC' || code === 'MDC') return 'Zona — pequena área';
    if (code === 'DE' || code === 'ALE') return 'Ao 2.º poste';
    if (code === 'DD' || code === 'ALD') return 'Ao 1.º poste';
    return 'Marcação individual';
  }
  if (code === 'GR') return '';
  if (code === 'DC') return idx % 2 ? 'Atacar o 2.º poste' : 'Atacar o centro';
  if (code === 'PL') return idx % 2 ? 'Tapar o guarda-redes' : 'Atacar o 1.º poste';
  if (code === 'DE' || code === 'DD' || code === 'ALE' || code === 'ALD') return 'Ficar atrás';
  if (code === 'MDC') return 'Ficar atrás';
  return 'Entrada da área';
}
export function spJob(t: Tactic, routine: SPKey, i: number): string {
  const { slot, p } = slotRole(t, i);
  const r = t.setPieces[routine] || {};
  const jobs = routine === 'cantoDef' ? SP_DEFEND_JOBS : SP_ATTACK_JOBS;
  const j = r.jobs?.[p.pid];
  return j && jobs.includes(j) ? j : defaultJob(slot.code, routine, i);
}
/** Batedor: escolhido, ou o melhor passador em campo que não seja GR nem central. */
export function spTaker(t: Tactic, routine: SPKey, squad: any[]): string {
  const r = t.setPieces[routine] || {};
  if (r.taker && t.players.some((p) => p.pid === r.taker)) return r.taker;
  let best = '', bv = -1;
  t.players.forEach((p, i) => {
    const code = FORMATIONS[t.formation][i].code;
    if (code === 'GR' || code === 'DC') return;
    const sp = squad.find((s) => s.id === p.pid);
    const v = (attrNum(sp, 'Passe') || 0) + (attrNum(sp, 'Técnica') || 0);
    if (v > bv) { bv = v; best = p.pid; }
  });
  return best;
}
export function spPositions(t: Tactic, routine: SPKey, squad: any[]): { pos: [number, number][]; ball: [number, number]; target: [number, number] | null } {
  const r = t.setPieces[routine] || {};
  const right = r.side !== 'Esquerda';
  const mir = (p: [number, number]): [number, number] => (right ? p : [100 - p[0], p[1]]);
  const taker = routine === 'cantoDef' ? '' : spTaker(t, routine, squad);
  const counts: Record<string, number> = {};
  const pos = t.players.map((p, i) => {
    const code = FORMATIONS[t.formation][i].code;
    if (routine === 'cantoDef') {
      if (code === 'GR') return [50, 95] as [number, number];
      const job = spJob(t, routine, i);
      const n = (counts[job] = (counts[job] || 0) + 1) - 1;
      const [bx, by] = JOB_SPOT_DEF[job] || [50, 88];
      const spread = job === 'Zona — pequena área' ? [0, -9, 9, -18, 18][n % 5] : job === 'Marcação individual' ? [-14, 14, -5, 5, -22, 22][n % 6] : job === 'Ficar na frente' ? [0, -16, 16][n % 3] : [0, -10, 10][n % 3];
      const dy = job === 'Marcação individual' ? (n % 2) * 3 : 0;
      return mir([bx + spread, by - dy]);
    }
    if (code === 'GR') return [50, 88] as [number, number];
    if (p.pid === taker) return mir(routine === 'cantoOf' ? [97, 2] : [84, 24]);
    const job = spJob(t, routine, i);
    const n = (counts[job] = (counts[job] || 0) + 1) - 1;
    const [bx, by] = JOB_SPOT_ATK[job] || [50, 20];
    const spread = job === 'Ficar atrás' ? [-14, 14, 0][n % 3] : job === 'Entrada da área' ? [0, -12, 12, -22][n % 4] : [0, -5, 5][n % 3];
    const dy = job === 'Ficar atrás' ? 0 : n * 2.5;
    const base: [number, number] = routine === 'livreOf' && job !== 'Ficar atrás' && job !== 'Opção curta' ? [bx, by + 4] : [bx, by];
    return mir([base[0] + spread, base[1] + dy]);
  });
  const ball: [number, number] = routine === 'cantoDef' ? mir([97, 98]) : routine === 'cantoOf' ? mir([98, 1.5]) : mir([86, 25]);
  let target: [number, number] | null = null;
  if (routine !== 'cantoDef') {
    const d = r.delivery;
    const map: Record<string, [number, number]> = { '1.º poste': [58, 7], Centro: [50, 10], '2.º poste': [40, 8], 'Entrada da área': [50, 22], Curto: [86, 9], 'Remate direto': [50, 1], Misto: [50, 10] };
    target = mir(map[d] || [50, 10]);
  }
  return { pos, ball, target };
}

// ---------------------------------------------------------------------------
// Medidores: familiaridade, intensidade, fluidez e perfil da tática.
export function diffCount(a: Tactic, b: Tactic): number {
  let n = 0;
  if (a.formation !== b.formation) n += 6;
  if (a.mentality !== b.mentality) n += 2;
  (['ataque', 'defesa', 'transof', 'transdef'] as const).forEach((m) => TEAM_INSTR[m].forEach((ins) => { if (teamValue(ins, a.team[m]) !== teamValue(ins, b.team[m])) n++; }));
  for (let i = 0; i < 11; i++) {
    const pa = a.players[i] || ({} as PlayerT), pb = b.players[i] || ({} as PlayerT);
    if (pa.pid !== pb.pid) n++;
    if ((pa.role || '') !== (pb.role || '')) n += 2;
    if ((pa.duty || '') !== (pb.duty || '')) n++;
    (['posse', 'sem', 'trans'] as const).forEach((g) => { const ka = pa[g] || {}, kb = pb[g] || {}; new Set([...Object.keys(ka), ...Object.keys(kb)]).forEach((k) => { if (ka[k] !== kb[k]) n += 0.5; }); });
  }
  return Math.round(n);
}
export function familiarity(t: Tactic, plan: Tactic): number {
  return Math.max(12, 100 - diffCount(t, plan) * 3);
}
/** Exigência física (0–100): pressão, ritmo, contrapressão, linha e deveres de ataque. */
export function intensity(t: Tactic): number {
  let v = 22;
  v += tl(t, 'defesa', 'intensity') * 22 + tl(t, 'defesa', 'block') * 10 + tl(t, 'defesa', 'line') * 6;
  v += tl(t, 'ataque', 'tempo') * 10 + (tv(t, 'transdef', 'lost') === 'Contrapressão' ? 12 : tv(t, 'transdef', 'lost') === 'Equilibrado' ? 5 : 0);
  v += (ment(t) + 3) * 1.2;
  for (let i = 0; i < 11; i++) {
    const { duty } = slotRole(t, i);
    if (duty === 'At') v += 1.2;
    if (effective(t, i, 'sem', 'press') === 'Mais') v += 1.2;
  }
  return clamp(Math.round(v), 5, 100);
}
export function intensityLabel(v: number) { return v < 30 ? 'Baixa' : v < 50 ? 'Moderada' : v < 68 ? 'Alta' : v < 84 ? 'Muito alta' : 'Extrema'; }

export function fluidity(t: Tactic): { label: string; value: number } {
  let v = 0;
  for (let i = 0; i < 11; i++) {
    const { role, duty, slot } = slotRole(t, i);
    if (slot.code === 'GR') continue;
    if (duty === 'Ap') v += 1;
    if (effective(t, i, 'posse', 'freedom') === 'Livre') v += 1;
    if (role.playmaker) v += 0.5;
    if (duty === 'De' && GROUP[slot.code] !== 'def') v -= 0.5;
  }
  v += tv(t, 'ataque', 'creative') === 'Expressiva' ? 2 : tv(t, 'ataque', 'creative') === 'Disciplinada' ? -2 : 0;
  const labels = ['Muito estruturada', 'Estruturada', 'Flexível', 'Fluida', 'Muito fluida'];
  const k = clamp(Math.floor((v + 1) / 3), 0, 4);
  return { label: labels[k], value: k };
}

/** Perfil da tática em seis eixos (0–100) — o "radar" da equipa. */
export function profile(t: Tactic): { k: string; v: number; d: string }[] {
  let wide = 0, atk = 0, def = 0, risk = 0, press = 0;
  for (let i = 0; i < 11; i++) {
    const { role, duty, slot } = slotRole(t, i);
    if (slot.code === 'GR') continue;
    if ((role.wide || effective(t, i, 'posse', 'width') === 'Mais largo') && duty !== 'De') wide++;
    if (duty === 'At') atk++;
    if (duty === 'De') def++;
    if (effective(t, i, 'posse', 'passRisk') === 'Arriscado') risk++;
    if (effective(t, i, 'sem', 'press') === 'Mais') press++;
  }
  const r = (v: number) => clamp(Math.round(v), 0, 100);
  return [
    { k: 'Pressão', v: r(tl(t, 'defesa', 'intensity') * 55 + tl(t, 'defesa', 'block') * 25 + press * 4), d: 'Quanto e onde a equipa vai à bola.' },
    { k: 'Largura', v: r(tl(t, 'ataque', 'tWidth') * 60 + wide * 9), d: 'Quanto campo ocupa com bola.' },
    { k: 'Verticalidade', v: r(tl(t, 'ataque', 'tempo') * 35 + tl(t, 'ataque', 'tPass') * 40 + atk * 4), d: 'Velocidade até à baliza.' },
    { k: 'Altura do bloco', v: r(tl(t, 'defesa', 'block') * 50 + tl(t, 'defesa', 'line') * 40 + (ment(t) + 3) * 2) , d: 'Distância da linha à própria baliza.' },
    { k: 'Risco com bola', v: r(risk * 9 + (tv(t, 'ataque', 'creative') === 'Expressiva' ? 25 : tv(t, 'ataque', 'creative') === 'Disciplinada' ? 0 : 12) + (ment(t) + 3) * 6), d: 'Passes e decisões de alto risco.' },
    { k: 'Proteção', v: r(def * 11 + (1 - tl(t, 'defesa', 'line')) * 25 + (tv(t, 'transdef', 'lost') === 'Reagrupar' ? 18 : 6)), d: 'Quantos ficam atrás da bola.' }
  ];
}

/** Análise automática: pontos fortes e pontos a vigiar, por momento. */
export function analyse(t: Tactic, squad: any[]): { good: string[]; bad: string[] } {
  const good: string[] = [], bad: string[] = [];
  const roles = t.players.map((_, i) => slotRole(t, i));
  const by = (pid: string) => squad.find((s) => s.id === pid);
  const pm = roles.filter((r) => r.role.playmaker).length;
  const wide = roles.filter((r, i) => (r.role.wide || effective(t, i, 'posse', 'width') === 'Mais largo') && r.duty !== 'De' && r.slot.code !== 'GR').length;
  const atk = roles.filter((r) => r.duty === 'At').length;
  const defd = roles.filter((r) => r.duty === 'De' && r.slot.code !== 'GR').length;
  const sts = roles.filter((r) => r.slot.code === 'PL');
  const line = tv(t, 'defesa', 'line');
  const cbs = roles.filter((r) => r.slot.code === 'DC').map((r) => by(r.p.pid));
  const cbPace = cbs.map((p) => attrNum(p, 'Aceleração')).filter((v): v is number => v !== null);
  const stam = roles.map((r) => attrNum(by(r.p.pid), 'Resistência')).filter((v): v is number => v !== null);
  const avgStam = stam.length ? stam.reduce((a, b) => a + b, 0) / stam.length : null;
  const inten = intensity(t);
  const misfits = roles.filter((r) => r.p.pid && fitOf(by(r.p.pid), r.slot.code).level <= 1);

  if (pm === 0) bad.push('Ataque · Ninguém organiza: falta uma função de organizador para dar o último passe.');
  else if (pm > 2) bad.push(`Ataque · ${pm} organizadores querem a bola ao mesmo tempo — a circulação fica previsível.`);
  else good.push(`Ataque · ${pm === 1 ? 'Um organizador' : 'Dois organizadores'} a dar critério à construção.`);
  if (wide <= 1 && tv(t, 'ataque', 'tWidth') !== 'Muito larga') bad.push('Ataque · Pouca largura: só ' + wide + ' jogador dá profundidade pelos corredores.');
  else if (wide >= 2) good.push(`Ataque · Largura garantida: ${wide} jogadores esticam o campo.`);
  if (atk >= 6) bad.push(`Transição defensiva · ${atk} jogadores com dever de ataque: muito espaço nas costas ao perder a bola.`);
  if (atk <= 1) bad.push('Ataque · Só ' + atk + ' jogador ataca a área — difícil criar ocasiões.');
  if (sts.length === 1 && sts[0].duty === 'At' && !roles.some((r) => r.slot.code === 'MCO' || r.role.key === 'box' || r.role.key === 'mezzala' || r.role.key === 'volante')) bad.push('Ataque · O ponta de lança fica isolado: ninguém chega de segunda linha.');
  if (sts.length === 2 && sts.every((s) => s.duty === 'At')) bad.push('Ataque · Os dois avançados atacam a mesma zona — um deles devia apoiar.');
  if (sts.length === 2 && sts.some((s) => s.duty !== 'At') && sts.some((s) => s.duty === 'At')) good.push('Ataque · Dupla complementar na frente: um fixa, outro ataca o espaço.');
  if ((line === 'Subida' || line === 'Muito subida') && cbPace.length && Math.min(...cbPace) < 12) bad.push('Defesa · Linha subida com um central lento: bolas nas costas são um perigo.');
  if ((line === 'Subida' || line === 'Muito subida') && !roles.some((r) => r.role.key === 'gr-libero')) bad.push('Defesa · Linha subida sem guarda-redes líbero a cobrir a profundidade.');
  if (tv(t, 'defesa', 'block') === 'Média' && tv(t, 'defesa', 'compact') === 'Estreita') good.push('Defesa · Bloco médio e estreito: o meio fica fechado e o adversário é empurrado para fora.');
  if (tv(t, 'defesa', 'block') === 'Baixa' && (line === 'Subida' || line === 'Muito subida')) bad.push('Defesa · Pressão baixa com linha subida: o bloco parte-se ao meio.');
  if (tv(t, 'defesa', 'offside') === 'Sim' && (line === 'Recuada' || line === 'Muito recuada')) bad.push('Defesa · Armadilha do fora de jogo com linha recuada raramente funciona.');
  if (defd >= 3) good.push(`Transição defensiva · ${defd} jogadores com dever defensivo seguram a equipa ao perder a bola.`);
  if (defd <= 1) bad.push('Transição defensiva · Quase ninguém fica atrás: o contra-ataque adversário encontra campo aberto.');
  if (tv(t, 'transof', 'won') === 'Contra-ataque' && roles.some((r) => r.duty === 'At' && GROUP[r.slot.code] === 'av')) good.push('Transição ofensiva · Contra-ataque com referência na frente — a bola ganha tem destino.');
  if (tv(t, 'transdef', 'lost') === 'Contrapressão' && avgStam !== null && avgStam < 12) bad.push('Transição defensiva · Contrapressão exigente para a resistência média do onze.');
  if (inten >= 80) bad.push(`Físico · Intensidade ${intensityLabel(inten).toLowerCase()}: a equipa vai sofrer na última meia hora.`);
  else if (inten <= 45) good.push('Físico · Plano económico: a equipa chega fresca ao fim do jogo.');
  misfits.forEach((r) => { const p = by(r.p.pid); bad.push(`Plantel · ${p?.short || p?.name || 'Jogador'} está ${fitOf(p, r.slot.code).label.toLowerCase()} como ${POS_NAMES[r.slot.code].toLowerCase()}.`); });
  const heads = roles.filter((r) => r.slot.code !== 'GR').map((r) => attrNum(by(r.p.pid), 'Cabeceamento')).filter((v): v is number => v !== null).sort((a, b) => b - a);
  if (heads.length >= 3 && heads[0] + heads[1] + heads[2] >= 45) good.push('Bola parada · Três cabeceadores fortes para atacar cantos e livres.');
  return { good, bad };
}

/** Resumo das instruções de equipa diferentes do padrão (para a barra lateral). */
export function teamSummary(t: Tactic, m: 'ataque' | 'defesa' | 'transof' | 'transdef'): string[] {
  return TEAM_INSTR[m].filter((ins) => teamValue(ins, t.team[m]) !== ins.def).map((ins) => `${ins.label}: ${teamValue(ins, t.team[m])}`);
}

/** Completa jogadores guardados antes de existirem posições/atributos com os valores de origem (seed). */
export function withScoutFallback(players: any[], seedPlayers: any[]): any[] {
  return (players || []).map((p) => {
    const s = seedPlayers.find((x) => x.id === p.id);
    if (!s) return p;
    const hasAttrs = p.attrs && Object.values(p.attrs).some((v) => String(v ?? '').trim() !== '');
    return { ...p, positions: Array.isArray(p.positions) && p.positions.length ? p.positions : s.positions, attrs: hasAttrs ? p.attrs : s.attrs };
  });
}
