// Motor do Laboratório tático (Relvado): formações, funções por posição e instruções.
// Mecânicas inspiradas nos simuladores de gestão de futebol (fases com/sem bola, funções,
// instruções com valores, instruções bloqueadas pela função, "alterada" vs. padrão da função).

export type Slot = { code: string; x: number; y: number };

/** Posições: GR, DC, DE/DD (laterais), ALE/ALD (alas), MDC, MC, ME/MD, MCO, EE/ED (extremos), PL. */
export const POS_NAMES: Record<string, string> = {
  GR: 'Guarda-redes', DC: 'Defesa central', DE: 'Lateral esquerdo', DD: 'Lateral direito',
  ALE: 'Ala esquerdo', ALD: 'Ala direito', MDC: 'Médio defensivo', MC: 'Médio centro',
  ME: 'Médio esquerdo', MD: 'Médio direito', MCO: 'Médio ofensivo', EE: 'Extremo esquerdo',
  ED: 'Extremo direito', PL: 'Ponta de lança'
};

// Ordem dos 11 lugares: GR, defesas (esq→dir), médios (esq→dir), avançados (esq→dir).
export const FORMATIONS: Record<string, Slot[]> = {
  '4-4-2': [
    { code: 'GR', x: 50, y: 92 }, { code: 'DE', x: 15, y: 72 }, { code: 'DC', x: 38, y: 76 }, { code: 'DC', x: 62, y: 76 }, { code: 'DD', x: 85, y: 72 },
    { code: 'ME', x: 15, y: 46 }, { code: 'MC', x: 38, y: 51 }, { code: 'MC', x: 62, y: 51 }, { code: 'MD', x: 85, y: 46 },
    { code: 'PL', x: 38, y: 21 }, { code: 'PL', x: 62, y: 21 }
  ],
  '4-3-3': [
    { code: 'GR', x: 50, y: 92 }, { code: 'DE', x: 15, y: 72 }, { code: 'DC', x: 38, y: 76 }, { code: 'DC', x: 62, y: 76 }, { code: 'DD', x: 85, y: 72 },
    { code: 'MC', x: 30, y: 49 }, { code: 'MDC', x: 50, y: 58 }, { code: 'MC', x: 70, y: 49 },
    { code: 'EE', x: 16, y: 24 }, { code: 'PL', x: 50, y: 17 }, { code: 'ED', x: 84, y: 24 }
  ],
  '4-2-3-1': [
    { code: 'GR', x: 50, y: 92 }, { code: 'DE', x: 15, y: 72 }, { code: 'DC', x: 38, y: 76 }, { code: 'DC', x: 62, y: 76 }, { code: 'DD', x: 85, y: 72 },
    { code: 'MDC', x: 38, y: 57 }, { code: 'MDC', x: 62, y: 57 }, { code: 'EE', x: 16, y: 34 }, { code: 'MCO', x: 50, y: 36 }, { code: 'ED', x: 84, y: 34 },
    { code: 'PL', x: 50, y: 16 }
  ],
  '3-5-2': [
    { code: 'GR', x: 50, y: 92 }, { code: 'DC', x: 28, y: 75 }, { code: 'DC', x: 50, y: 78 }, { code: 'DC', x: 72, y: 75 },
    { code: 'ALE', x: 10, y: 48 }, { code: 'MC', x: 33, y: 52 }, { code: 'MDC', x: 50, y: 60 }, { code: 'MC', x: 67, y: 52 }, { code: 'ALD', x: 90, y: 48 },
    { code: 'PL', x: 38, y: 20 }, { code: 'PL', x: 62, y: 20 }
  ],
  '5-3-2': [
    { code: 'GR', x: 50, y: 92 }, { code: 'ALE', x: 10, y: 66 }, { code: 'DC', x: 30, y: 76 }, { code: 'DC', x: 50, y: 79 }, { code: 'DC', x: 70, y: 76 },
    { code: 'ALD', x: 90, y: 66 }, { code: 'MC', x: 30, y: 50 }, { code: 'MC', x: 50, y: 54 }, { code: 'MC', x: 70, y: 50 },
    { code: 'PL', x: 38, y: 21 }, { code: 'PL', x: 62, y: 21 }
  ]
};

/** Funções disponíveis por posição, com valores por omissão e instruções bloqueadas. */
export type Role = { key: string; name: string; desc: string; defaults?: Record<string, string>; locked?: string[] };
const R = (key: string, name: string, desc: string, defaults: Record<string, string> = {}, locked: string[] = []): Role => ({ key, name, desc, defaults, locked });

const GK = [
  R('gr', 'Guarda-redes', 'Fica na baliza e joga simples.', { saidaGR: 'Curta' }, ['dribble', 'runs', 'shoot', 'cross', 'hold', 'width']),
  R('gr-libero', 'Guarda-redes líbero', 'Sai da área para cobrir o espaço atrás da linha.', { saidaGR: 'Curta', passRisk: 'Arriscado' }, ['dribble', 'runs', 'shoot', 'cross', 'hold', 'width'])
];
const CB = [
  R('central', 'Central', 'Defende primeiro: corta, cobre e não arrisca.', { passRisk: 'Seguro' }, ['runs', 'shoot', 'cross', 'hold', 'width']),
  R('central-org', 'Central organizador', 'Comanda a altura da linha e dá a primeira saída.', { passRisk: 'Normal' }, ['runs', 'shoot', 'cross', 'hold', 'width']),
  R('central-constr', 'Central construtor', 'Conduz e procura o passe vertical.', { passRisk: 'Arriscado', dribble: 'Mais' }, ['shoot', 'cross', 'hold', 'width'])
];
const FB = [
  R('lateral', 'Lateral', 'Equilibra: sobe quando há espaço, recua cedo.', {}, ['hold']),
  R('lateral-of', 'Lateral ofensivo', 'Dá largura e chega ao último terço.', { runs: 'Mais', cross: 'Mais', width: 'Mais largo' }, ['hold']),
  R('lateral-def', 'Lateral defensivo', 'Fica atrás e fecha o corredor.', { runs: 'Menos', freedom: 'Fixo' }, ['hold', 'shoot'])
];
const WB = [
  R('ala', 'Ala', 'Ocupa o corredor inteiro, de área a área.', { runs: 'Mais', width: 'Mais largo' }, ['hold']),
  R('ala-def', 'Ala defensivo', 'Forma linha de cinco sem bola.', { runs: 'Menos' }, ['hold'])
];
const DM = [
  R('trinco', 'Trinco', 'Protege a defesa e corta linhas de passe.', { runs: 'Menos', freedom: 'Fixo' }, ['cross', 'width']),
  R('org-recuado', 'Organizador recuado', 'Recebe entre centrais e distribui.', { passRisk: 'Arriscado', freedom: 'Fixo' }, ['cross', 'width'])
];
const CM = [
  R('box', 'Box-to-box', 'Liga as duas áreas: recupera e aparece na finalização.', { runs: 'Mais', freedom: 'Livre' }, ['width']),
  R('medio-def', 'Médio defensivo', 'Fecha por dentro e cobre as subidas.', { runs: 'Menos', press: 'Mais' }, ['width', 'cross']),
  R('medio-ofens', 'Médio ofensivo', 'Ataca o espaço entre linhas.', { runs: 'Mais', shoot: 'Mais' }, ['width'])
];
const WM = [
  R('medio-ala', 'Médio-ala', 'Defende o corredor e dá largura com bola.', { width: 'Mais largo' }, []),
  R('ala-defensivo', 'Ala defensivo', 'Recua até à linha defensiva sem bola.', { runs: 'Menos', press: 'Mais' }, []),
  R('ala-interior', 'Ala interior', 'Fecha para dentro e procura a área.', { width: 'Mais estreito', shoot: 'Mais' }, [])
];
const AM = [
  R('n10', 'Número 10', 'Joga entre linhas e procura o último passe.', { passRisk: 'Arriscado', freedom: 'Livre' }, ['width']),
  R('segundo-av', 'Segundo avançado', 'Chega à área atrás do ponta de lança.', { runs: 'Mais', shoot: 'Mais' }, ['width'])
];
const W = [
  R('extremo', 'Extremo', 'Abre o campo e cruza.', { width: 'Mais largo', cross: 'Mais', dribble: 'Mais' }, []),
  R('extremo-inv', 'Extremo invertido', 'Entra em diagonal para o pé forte.', { width: 'Mais estreito', shoot: 'Mais', dribble: 'Mais' }, ['cross'])
];
const ST = [
  R('pl', 'Ponta de lança', 'Ataca a profundidade e finaliza.', { runs: 'Mais', shoot: 'Mais' }, ['width', 'cross']),
  R('pressao', 'Avançado de pressão', 'Primeiro defensor: fecha o passe para o pivô.', { press: 'Mais', closePass: 'Sim' }, ['width', 'cross']),
  R('alvo', 'Homem-alvo', 'Segura a bola de costas e liga o jogo.', { hold: 'Sim', runs: 'Menos' }, ['width', 'cross', 'hold']),
  R('falso9', 'Falso 9', 'Recua para criar superioridade no meio.', { freedom: 'Livre', runs: 'Menos', passRisk: 'Arriscado' }, ['width', 'cross'])
];
export const ROLES: Record<string, Role[]> = {
  GR: GK, DC: CB, DE: FB, DD: FB, ALE: WB, ALD: WB, MDC: DM, MC: CM, ME: WM, MD: WM, MCO: AM, EE: W, ED: W, PL: ST
};

/** Instruções individuais. `glyph` escolhe o pequeno desenho do cartão. */
export type Instr = { key: string; label: string; glyph: string; options: string[]; def: string };
export const PLAYER_INSTR: Record<'posse' | 'sem', Instr[]> = {
  posse: [
    { key: 'width', label: 'Largura', glyph: 'width', options: ['Mais estreito', 'Normal', 'Mais largo'], def: 'Normal' },
    { key: 'runs', label: 'Corridas em profundidade', glyph: 'runs', options: ['Menos', 'Normal', 'Mais'], def: 'Normal' },
    { key: 'freedom', label: 'Liberdade de movimento', glyph: 'freedom', options: ['Fixo', 'Segue a tática', 'Livre'], def: 'Segue a tática' },
    { key: 'hold', label: 'Segurar a bola', glyph: 'hold', options: ['Não', 'Sim'], def: 'Não' },
    { key: 'dribble', label: 'Drible', glyph: 'dribble', options: ['Menos', 'Normal', 'Mais'], def: 'Normal' },
    { key: 'shoot', label: 'Remate', glyph: 'shoot', options: ['Menos', 'Normal', 'Mais'], def: 'Normal' },
    { key: 'passRisk', label: 'Risco de passe', glyph: 'pass', options: ['Seguro', 'Normal', 'Arriscado'], def: 'Normal' },
    { key: 'cross', label: 'Cruzamentos', glyph: 'cross', options: ['Menos', 'Normal', 'Mais'], def: 'Normal' }
  ],
  sem: [
    { key: 'press', label: 'Pressão', glyph: 'press', options: ['Menos', 'Normal', 'Mais'], def: 'Normal' },
    { key: 'closePass', label: 'Fechar linha de passe', glyph: 'close', options: ['Não', 'Sim'], def: 'Não' },
    { key: 'mark', label: 'Marcação', glyph: 'mark', options: ['À zona', 'Individual'], def: 'À zona' },
    { key: 'tackle', label: 'Desarme', glyph: 'tackle', options: ['Cuidadoso', 'Normal', 'Agressivo'], def: 'Normal' },
    { key: 'track', label: 'Acompanhar o adversário', glyph: 'track', options: ['Não', 'Sim'], def: 'Sim' }
  ]
};

/** Instruções de equipa, por fase (com bola / transição / sem bola). */
export const TEAM_INSTR: Record<'posse' | 'transicao' | 'sem', Instr[]> = {
  posse: [
    { key: 'tWidth', label: 'Largura do ataque', glyph: 'width', options: ['Estreito', 'Normal', 'Largo'], def: 'Normal' },
    { key: 'tempo', label: 'Ritmo', glyph: 'tempo', options: ['Lento', 'Normal', 'Rápido'], def: 'Normal' },
    { key: 'tPass', label: 'Tipo de passe', glyph: 'pass', options: ['Curto', 'Misto', 'Direto'], def: 'Misto' },
    { key: 'saidaGR', label: 'Saída do guarda-redes', glyph: 'gk', options: ['Curta', 'Mista', 'Longa'], def: 'Mista' },
    { key: 'attackZone', label: 'Zona de ataque', glyph: 'zone', options: ['Pela esquerda', 'Equilibrado', 'Pela direita', 'Pelo meio'], def: 'Equilibrado' }
  ],
  transicao: [
    { key: 'lost', label: 'Ao perder a bola', glyph: 'press', options: ['Reagrupar', 'Equilibrado', 'Contrapressão'], def: 'Equilibrado' },
    { key: 'won', label: 'Ao ganhar a bola', glyph: 'runs', options: ['Manter a posse', 'Equilibrado', 'Contra-ataque'], def: 'Equilibrado' },
    { key: 'gkDist', label: 'Reposição do GR', glyph: 'gk', options: ['Lenta', 'Normal', 'Rápida'], def: 'Normal' }
  ],
  sem: [
    { key: 'block', label: 'Altura do bloco', glyph: 'block', options: ['Baixo', 'Médio', 'Alto'], def: 'Médio' },
    { key: 'line', label: 'Linha defensiva', glyph: 'line', options: ['Recuada', 'Normal', 'Subida'], def: 'Normal' },
    { key: 'intensity', label: 'Intensidade da pressão', glyph: 'press', options: ['Baixa', 'Normal', 'Alta'], def: 'Normal' },
    { key: 'trigger', label: 'Gatilho de pressão', glyph: 'trigger', options: ['Sempre', 'Bola na ala', 'Passe atrasado'], def: 'Sempre' },
    { key: 'compact', label: 'Distância entre linhas', glyph: 'compact', options: ['Curta', 'Normal', 'Longa'], def: 'Normal' }
  ]
};

export const ATTRS = ['Velocidade', 'Técnica', 'Passe', 'Finalização', 'Posicionamento', 'Físico'];

export function roleOf(code: string, key: string | undefined): Role {
  const list = ROLES[code] || ST;
  return list.find((r) => r.key === key) || list[0];
}

/** Valor efetivo de uma instrução para um jogador (escolha > padrão da função > padrão da instrução). */
export function instrValue(ins: Instr, role: Role, chosen: Record<string, string> | undefined) {
  const locked = role.locked?.includes(ins.key);
  const roleDef = role.defaults?.[ins.key] ?? ins.def;
  if (locked) return { value: roleDef, locked: true, tweaked: false };
  const v = chosen?.[ins.key];
  const value = v && ins.options.includes(v) ? v : roleDef;
  return { value, locked: false, tweaked: value !== roleDef };
}
