// src/data/normativasCamacari.ts
import { TipoSolicitacao, ModalidadeLicenca, TipologiaAtividade, CnaeItem } from '../types';

export interface ZoneamentoItem {
  valor: string;
  label: string;
}

export interface DocumentoBaseItem {
  id: number;
  nome: string;
  obrigatorioBase: boolean;
  obrigatorio?: boolean; // Compatibilidade retroativa
  somenteRenovacao?: boolean;
  tipologiasObrigatorias?: TipologiaAtividade[];
  somenteTipologias?: TipologiaAtividade[];
  excluirEmInexigibilidade?: boolean;
}

export const ZONEAMENTOS_CAMACARI: ZoneamentoItem[] = [
  { valor: 'ZOUC 1', label: 'ZOUC 1 - Zona de Ocupação Urbana Consolidada 1 (Sede)' },
  { valor: 'ZOUC 2', label: 'ZOUC 2 - Zona de Ocupação Urbana Consolidada 2 (Orla e Expansão)' },
  { valor: 'ZDC 1', label: 'ZDC 1 - Zona de Desenvolvimento e Comércio 1' },
  { valor: 'ZDC 2', label: 'ZDC 2 - Zona de Desenvolvimento e Comércio 2' },
  { valor: 'ZDC 3', label: 'ZDC 3 - Zona de Desenvolvimento e Comércio 3 (Corredores Rodoviários)' },
  { valor: 'ZDC 4', label: 'ZDC 4 - Zona de Desenvolvimento e Comércio 4' },
  { valor: 'ZDC 5', label: 'ZDC 5 - Zona de Desenvolvimento da Costa – ZDC 5' },
  { valor: 'ZPIC', label: 'ZPIC - Zona de Polo Industrial de Camaçari' },
  { valor: 'ZEIS', label: 'ZEIS - Zona Especial de Interesse Social' },
  { valor: 'ZTR', label: 'ZTR - Zona Turística e Residencial (Litoral / Orla)' },
  { valor: 'ZIT', label: 'ZIT - Zona de Interesse Turístico' },
  { valor: 'ZEU', label: 'ZEU - Zona de Expansão Urbana' },
  { valor: 'ZPA', label: 'ZPA - Zona de Proteção Ambiental' },
];

export const DOCUMENTOS_BASE_CAMACARI: DocumentoBaseItem[] = [
  { id: 1, nome: 'Documento de identificação do requerente: RG (PF) ou Contrato Social e RG dos sócios (PJ)', obrigatorioBase: true },
  { id: 2, nome: 'Cópia do Cartão CNPJ ativo e Inscrição Estadual (PJ)', obrigatorioBase: true },
  { id: 3, nome: 'Procuração do requerente com poderes específicos (se processo formalizado por terceiro)', obrigatorioBase: false },
  { id: 4, nome: 'Certidão de matrícula e ônus reais do Cartório de Registro de Imóveis (RGI) OU Contrato de Locação/Posse legítima', obrigatorioBase: true },
  { id: 5, nome: 'Certidão Negativa de Débitos Municipais e Imobiliários / IPTU (SEFAZ Camaçari)', obrigatorioBase: true },
  { id: 6, nome: 'Consulta Prévia de Viabilidade emitida pela SEDUR (ou Alvará de Localização)', obrigatorioBase: true },
  { id: 7, nome: 'Requerimento de Licenciamento Ambiental assinado (disponível no SIS-SEDUR)', obrigatorioBase: true },
  { id: 8, nome: 'Relatório de Caracterização do Empreendimento - RCE (Modelo SEDUR assinado)', obrigatorioBase: true },
  { id: 9, nome: 'Termo de Responsabilidade Ambiental - TRA (Modelo SEDUR)', obrigatorioBase: true, excluirEmInexigibilidade: true },
  { id: 10, nome: 'Planta georreferenciada de localização do empreendimento (vias de acesso, corpos hídricos, meio digital)', obrigatorioBase: true },
  { id: 11, nome: 'Projeto Básico do empreendimento (Planta de Situação georreferenciada SIRGAS 2000)', obrigatorioBase: true },
  { id: 12, nome: 'Comprovantes de quitação bancária dos DAMs municipais (Abertura e Taxa de Licenciamento)', obrigatorioBase: true },
  { id: 13, nome: 'Certificado de Licença do Corpo de Bombeiros Militar (AVCB ou CLCB vigente)', obrigatorioBase: true },

  // Estudos Ambientais Específicos para LAS (Classes 1 e 2)
  { 
    id: 14, 
    nome: 'Estudo Ambiental para Atividades de Pequeno Impacto (EPI), conforme Termo de Referência da SEDUR', 
    obrigatorioBase: false, 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL', 'MINERACAO', 'URBANISTICO', 'OBRA', 'ERB'] 
  },
  { 
    id: 15, 
    nome: 'Mapa de Restrições Ambientais / Projeto Básico georreferenciado (SIRGAS 2000) com quadro de áreas e APPs', 
    obrigatorioBase: false, 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL', 'MINERACAO', 'URBANISTICO', 'OBRA', 'ERB'] 
  },

  // Específicos: Posto de Combustíveis
  { 
    id: 16, 
    nome: 'Projeto Básico de equipamentos, sistemas de monitoramento, detecção de vazamentos e tanques de combustíveis (SASC) conforme Normas ABNT', 
    obrigatorioBase: false, 
    somenteTipologias: ['POSTO_COMBUSTIVEL'], 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL'] 
  },
  { 
    id: 17, 
    nome: 'Plantas do sistema de coleta e tratamento de efluentes líquidos com Caixa Separadora de Água e Óleo (CSAO) e drenagem pluvial', 
    obrigatorioBase: false, 
    somenteTipologias: ['POSTO_COMBUSTIVEL'], 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL'] 
  },

  // Específicos: Mineração
  { 
    id: 18, 
    nome: 'Certidão sobre a situação do processo no Departamento Nacional de Produção Mineral (DNPM / ANM)', 
    obrigatorioBase: false, 
    somenteTipologias: ['MINERACAO'], 
    tipologiasObrigatorias: ['MINERACAO'] 
  },
  { 
    id: 19, 
    nome: 'Alvará de Pesquisa do DNPM/ANM com relatório de pesquisa, Guia de Utilização de minério ou Portaria de Lavra', 
    obrigatorioBase: false, 
    somenteTipologias: ['MINERACAO'], 
    tipologiasObrigatorias: ['MINERACAO'] 
  },
  { 
    id: 20, 
    nome: 'Levantamento topográfico planialtimétrico cadastral georreferenciado (SIRGAS 2000, curvas de nível de 1m)', 
    obrigatorioBase: false, 
    somenteTipologias: ['MINERACAO'], 
    tipologiasObrigatorias: ['MINERACAO'] 
  },
  { 
    id: 21, 
    nome: 'Documento comprobatório de posse/propriedade ou autorização expressa do superficiário com firma reconhecida', 
    obrigatorioBase: false, 
    somenteTipologias: ['MINERACAO'], 
    tipologiasObrigatorias: ['MINERACAO'] 
  },
  { 
    id: 22, 
    nome: 'Programa de Gerenciamento de Risco (PGR - Norma Técnica Resolução CEPRAM nº 4.578/2017) com ART', 
    obrigatorioBase: false, 
    somenteTipologias: ['MINERACAO'], 
    tipologiasObrigatorias: ['MINERACAO'] 
  },

  // Específicos: Urbanístico e Obras
  { 
    id: 23, 
    nome: 'Carta de viabilidade de serviços públicos de saneamento básico (EMBASA), energia (COELBA) e coleta de lixo (Prefeitura)', 
    obrigatorioBase: false, 
    somenteTipologias: ['POSTO_COMBUSTIVEL', 'URBANISTICO', 'OBRA'], 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL', 'URBANISTICO', 'OBRA'] 
  },
  { 
    id: 24, 
    nome: 'Projetos de abastecimento de água e esgotamento sanitário com memorial de cálculo aprovados pela EMBASA', 
    obrigatorioBase: false, 
    somenteTipologias: ['POSTO_COMBUSTIVEL', 'URBANISTICO', 'OBRA'], 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL', 'URBANISTICO', 'OBRA'] 
  },
  { 
    id: 25, 
    nome: 'Projeto de drenagem de águas pluviais do empreendimento acompanhado da respectiva ART', 
    obrigatorioBase: false, 
    somenteTipologias: ['URBANISTICO', 'OBRA'], 
    tipologiasObrigatorias: ['URBANISTICO', 'OBRA'] 
  },

  // Específicos: Estação Rádio Base (ERB)
  { 
    id: 26, 
    nome: 'Laudo Radiométrico Teórico com estimativa dos níveis máximos de densidade de potência e lóbulo principal (raio mín. 30m)', 
    obrigatorioBase: false, 
    somenteTipologias: ['ERB'], 
    tipologiasObrigatorias: ['ERB'] 
  },

  // Programas Ambientais e Resíduos
  { 
    id: 27, 
    nome: 'Plano de Gerenciamento de Resíduos Sólidos (PGRS) e/ou da Construção Civil (PGRSCC)', 
    obrigatorioBase: false, 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL', 'MINERACAO', 'URBANISTICO', 'OBRA', 'ERB'] 
  },
  { 
    id: 28, 
    nome: 'Relatório de Detalhamento dos Programas Ambientais e/ou Programa de Educação Ambiental', 
    obrigatorioBase: false, 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL', 'MINERACAO', 'URBANISTICO', 'OBRA'] 
  },

  // Específicos de Renovação
  { 
    id: 29, 
    nome: 'Cópia da Portaria / Certificado da Licença Ambiental Simplificada (LAS) anterior a renovar', 
    obrigatorioBase: true, 
    somenteRenovacao: true 
  },
  { 
    id: 30, 
    nome: 'Relatório Técnico Fotográfico de Cumprimento das Condicionantes da LAS anterior (MTR, laudos e notas)', 
    obrigatorioBase: true, 
    somenteRenovacao: true 
  },
];

export const FUNDAMENTACAO_LEGAL = {
  codigoMeioAmbiente: 'Lei Complementar Municipal nº 1.876/2023 (Código de Meio Ambiente de Camaçari, Art. 53, § 2º e Anexo IV)',
  pddu: 'Lei Complementar Municipal nº 1.873/2023 (PDDU Camaçari)',
  codigoUrbanistico: 'Lei Complementar Municipal nº 1.874/2023 (Código Urbanístico de Camaçari)',
  decretoEstadual: 'Decreto Estadual da Bahia nº 14.024/2012',
  cepram: 'Resoluções CEPRAM nº 4.327/2013, nº 4.578/2017 e nº 4.579/2018'
};

// Helper universal de obrigatoriedade
export function verificarDocumentoObrigatorio(doc: DocumentoBaseItem, tipologia: TipologiaAtividade = 'GERAL'): boolean {
  if (doc.somenteRenovacao) return true;
  if (doc.tipologiasObrigatorias && doc.tipologiasObrigatorias.includes(tipologia)) {
    return true;
  }
  return doc.obrigatorioBase ?? doc.obrigatorio ?? false;
}

export function detectarTipologiaPorCnaes(cnaes: CnaeItem[]): TipologiaAtividade {
  if (!cnaes || cnaes.length === 0) return 'GERAL';

  const textoCompleto = cnaes
    .map(c => `${c.codigo} ${c.descricao}`)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    textoCompleto.includes('4731') || 
    textoCompleto.includes('4732') || 
    textoCompleto.includes('4681') ||
    textoCompleto.includes('combustivel') || 
    textoCompleto.includes('combustiveis') ||
    textoCompleto.includes('posto de gasolina') ||
    textoCompleto.includes('trr')
  ) {
    return 'POSTO_COMBUSTIVEL';
  }

  if (
    textoCompleto.includes('0810') || 
    textoCompleto.includes('0891') || 
    textoCompleto.includes('0892') ||
    textoCompleto.includes('0899') ||
    textoCompleto.includes('0710') ||
    textoCompleto.includes('0721') ||
    textoCompleto.includes('mineracao') || 
    textoCompleto.includes('extracao') || 
    textoCompleto.includes('areal') || 
    textoCompleto.includes('pedreira') ||
    textoCompleto.includes('brita') ||
    textoCompleto.includes('saibro') ||
    textoCompleto.includes('lavra')
  ) {
    return 'MINERACAO';
  }

  if (
    textoCompleto.includes('6110') || 
    textoCompleto.includes('6120') || 
    textoCompleto.includes('6130') || 
    textoCompleto.includes('6190') ||
    textoCompleto.includes('telefonia movel') || 
    textoCompleto.includes('estacao radio base') || 
    textoCompleto.includes('torre de telecomunicacao') ||
    textoCompleto.includes('antena')
  ) {
    return 'ERB';
  }

  if (
    (textoCompleto.includes('6810') && (textoCompleto.includes('loteamento') || textoCompleto.includes('imoveis proprios'))) ||
    textoCompleto.includes('4110') ||
    textoCompleto.includes('loteamento') || 
    textoCompleto.includes('parcelamento do solo') || 
    textoCompleto.includes('desmembramento') ||
    textoCompleto.includes('condominio urbanistico')
  ) {
    return 'URBANISTICO';
  }

  if (
    textoCompleto.includes('4120') || 
    textoCompleto.includes('4211') || 
    textoCompleto.includes('4212') || 
    textoCompleto.includes('4213') || 
    textoCompleto.includes('4221') || 
    textoCompleto.includes('4299') ||
    textoCompleto.includes('4311') ||
    textoCompleto.includes('4313') ||
    textoCompleto.includes('construcao de edificios') ||
    textoCompleto.includes('terraplenagem') ||
    textoCompleto.includes('obras de urbanizacao')
  ) {
    return 'OBRA';
  }

  return 'GERAL';
}

export function formatarCnpj(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 14);
  if (d.length !== 14) return valor;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

export function inferirZoneamentoPorBairro(bairro: string): string {
  if (!bairro) return 'ZOUC 1';
  const b = bairro.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (b.includes('polo') || b.includes('petroquimico') || b.includes('industrial') || b.includes('copec')) {
    return 'ZPIC';
  }
  if (b.includes('areal') || b.includes('costa') || b.includes('zdc 5') || b.includes('zdc5')) {
    return 'ZDC 5';
  }
  if (b.includes('guarajuba') || b.includes('itacimirim') || b.includes('arembepe') || b.includes('jacuipe') || b.includes('monte gordo') || b.includes('busca vida') || b.includes('interlagos')) {
    return 'ZTR';
  }
  if (b.includes('abrantes') || b.includes('jaua') || b.includes('areias') || b.includes('catu') || b.includes('machadinho') || b.includes('buris')) {
    return 'ZOUC 2';
  }
  if (b.includes('cascalheira') || b.includes('parafuso') || b.includes('estrada do coco') || b.includes('ba-099') || b.includes('ba-535') || b.includes('ba 093') || b.includes('ba-093')) {
    return 'ZDC 3';
  }
  return 'ZOUC 1';
}

export interface ResultadoParsingSisSedur {
  numero_processo?: string;
  cnpj?: string;
  interessado?: string;
  endereco?: string;
  bairro?: string;
  area_m2?: number;
  coordenadas?: string;
  zona_sugerida?: string;
  tipoSolicitacao?: TipoSolicitacao;
  modalidade?: ModalidadeLicenca;
  numeroLicencaAnterior?: string;
  documentos_identificados: number[];
}

export function parseTextoDoSisSedur(textoBruto: string): ResultadoParsingSisSedur {
  const resultado: ResultadoParsingSisSedur = {
    documentos_identificados: [],
  };

  if (!textoBruto || textoBruto.trim() === '') return resultado;

  const textoLimpo = textoBruto.replace(/\u00a0/g, ' ').replace(/\r\n/g, '\n');
  const linhas = textoLimpo.split('\n').map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const linhaNorm = linha.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // CNPJ
    if (/^cnpj|^cpf\/cnpj|^inscri[cç][aã]o\s+federal/i.test(linhaNorm)) {
      let valor = linha.replace(/^[^:]*:\s*/, '').trim();
      if (!valor && i + 1 < linhas.length) {
        valor = linhas[i + 1].trim();
      }
      const digitos = valor.replace(/\D/g, '');
      if (digitos.length === 14) {
        resultado.cnpj = formatarCnpj(digitos);
      }
    }

    // INTERESSADO
    if (/^interessado|^requerente|^razao\s+social/i.test(linhaNorm)) {
      let valor = linha.replace(/^[^:]*:\s*/, '').trim();
      if (!valor && i + 1 < linhas.length) {
        valor = linhas[i + 1].trim();
      }
      if (valor) resultado.interessado = valor;
    }

    // PROCESSO
    if (/processo/i.test(linhaNorm)) {
      const trecho = linha + ' ' + (linhas[i + 1] || '');
      const matchProc = trecho.match(/\d{4,6}[./]\d{2}[./]\d{2}[./]\d{3,5}[./]\d{4}/);
      if (matchProc) {
        resultado.numero_processo = matchProc[0].replace(/\//g, '.');
      }
    }

    // ENDEREÇO
    if (/^endereco|^endereço|^localizacao/i.test(linhaNorm)) {
      let valor = linha.replace(/^[^:]*:\s*/, '').trim();
      if (!valor && i + 1 < linhas.length) {
        valor = linhas[i + 1].trim();
      }
      if (valor) {
        resultado.endereco = valor;
        const partes = valor.split(/,\s*/);
        if (partes.length >= 3) {
          const possivelBairro = partes[partes.length - 2].replace(/\s*-\s*ba/i, '').replace(/cama[cç]ari/i, '').trim();
          if (possivelBairro) {
            resultado.bairro = possivelBairro;
            resultado.zona_sugerida = inferirZoneamentoPorBairro(possivelBairro);
          }
        }
      }
    }

    // ASSUNTO / DEMANDA
    if (/^assunto|^servico|^serviço/i.test(linhaNorm)) {
      let valor = linha.replace(/^[^:]*:\s*/, '').trim();
      if (!valor && i + 1 < linhas.length) {
        valor = linhas[i + 1].trim();
      }
      const valNorm = valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (/renovacao|rlas/.test(valNorm)) {
        resultado.tipoSolicitacao = 'RENOVACAO';
        resultado.modalidade = 'RENOVACAO_LAS';
      } else if (/dispensa|dla/.test(valNorm)) {
        resultado.tipoSolicitacao = 'NOVA_LICENCA';
        resultado.modalidade = 'DISPENSA';
      } else if (/inexigibilidade/.test(valNorm)) {
        resultado.tipoSolicitacao = 'NOVA_LICENCA';
        resultado.modalidade = 'INEXIGIBILIDADE';
      } else if (/simplificada|las/.test(valNorm)) {
        resultado.tipoSolicitacao = 'NOVA_LICENCA';
        resultado.modalidade = 'LAS';
      }
    }
  }

  // Fallback para CNPJ
  if (!resultado.cnpj) {
    const matchCnpjGlobal = textoLimpo.match(/\b\d{2}[\s.]?\d{3}[\s.]?\d{3}[\s./]?\d{4}[\s.-]?\d{2}\b/);
    if (matchCnpjGlobal) {
      const digitos = matchCnpjGlobal[0].replace(/\D/g, '');
      if (digitos.length === 14) resultado.cnpj = formatarCnpj(digitos);
    }
  }

  // Fallback para Processo
  if (!resultado.numero_processo) {
    const matchP = textoLimpo.match(/(\d{4,6}[./]\d{2}[./]\d{2}[./]\d{3,5}[./]\d{4})/);
    if (matchP) resultado.numero_processo = matchP[0].replace(/\//g, '.');
  }

  // Leitura de Documentos
  const normalizado = textoLimpo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const docs = new Set<number>();
  if (/requerimento|solicitacao|formulario/.test(normalizado)) docs.add(7);
  if (/cartao cnpj|cartao do cnpj|comprovante cnpj|situacao cadastral/.test(normalizado)) docs.add(2);
  if (/contrato social|alteracao contratual|estatuto|juceb/.test(normalizado)) docs.add(1);
  if (/procuracao/.test(normalizado)) docs.add(3);
  if (/locacao|locaçao|aluguel|escritura|rgi|matricula/.test(normalizado)) docs.add(4);
  if (/iptu|certidao negativa|debitos municipais|sefaz/.test(normalizado)) docs.add(5);
  if (/viabilidade|consulta previa|alvara/.test(normalizado)) docs.add(6);
  if (/rce|caracterizacao do empreendimento/.test(normalizado)) docs.add(8);
  if (/termo de responsabilidade ambiental|tra/.test(normalizado)) docs.add(9);
  if (/planta georreferenciada|localizacao/.test(normalizado)) docs.add(10);
  if (/projeto basico|planta de situacao/.test(normalizado)) docs.add(11);
  if (/dam|taxa de abertura|taxa de licenciamento|quitacao/.test(normalizado)) docs.add(12);
  if (/bombeiro|bombeiros|avcb|clcb/.test(normalizado)) docs.add(13);
  if (/epi|estudo ambiental para atividades de pequeno impacto/.test(normalizado)) docs.add(14);
  if (/mapa de restricoes ambientais|mapa de restricoes/.test(normalizado)) docs.add(15);
  if (/sasc|equipamentos e sistemas de monitoramento|tanques/.test(normalizado)) docs.add(16);
  if (/csao|separadora de agua e oleo|efluentes/.test(normalizado)) docs.add(17);
  if (/dnpm|anm|processo minerario/.test(normalizado)) { docs.add(18); docs.add(19); }
  if (/topografico|curvas de nivel/.test(normalizado)) docs.add(20);
  if (/superficiario/.test(normalizado)) docs.add(21);
  if (/pgr|gerenciamento de risco/.test(normalizado)) docs.add(22);
  if (/carta de viabilidade|embasa.*coelba/.test(normalizado)) docs.add(23);
  if (/aprovados pela embasa|esgotamento sanitario/.test(normalizado)) docs.add(24);
  if (/drenagem de aguas pluviais|drenagem/.test(normalizado)) docs.add(25);
  if (/laudo radiometrico|radiometrico/.test(normalizado)) docs.add(26);
  if (/pgrs|pgrscc/.test(normalizado)) docs.add(27);
  if (/programas ambientais|educacao ambiental/.test(normalizado)) docs.add(28);
  if (/licenca anterior|las anterior|portaria/.test(normalizado)) docs.add(29);
  if (/condicionantes|mtr|sinir/.test(normalizado)) docs.add(30);

  resultado.documentos_identificados = Array.from(docs);
  return resultado;
}
