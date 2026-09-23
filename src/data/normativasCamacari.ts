// src/data/normativasCamacari.ts
import { TipoSolicitacao, ModalidadeLicenca, TipologiaAtividade, CnaeItem } from '../types';

export interface ZoneamentoItem {
  valor: string;
  label: string;
}

export interface DocumentoBaseItem {
  id: number;
  itemSedur: string; // Ex: "1.0", "13.0"
  nome: string;
  // Regras de obrigatoriedade estritas da coluna C das planilhas da SEDUR CLA
  obrigatorioPadrao: boolean;
  obrigatorioEmLas?: boolean;
  tipologiasObrigatorias?: TipologiaAtividade[];
  somenteTipologias?: TipologiaAtividade[];
  dispensadoEmInexigibilidade?: boolean;
  somenteRenovacao?: boolean;
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

// MATRIZ ESTRITA DAS PLANILHAS DA SEDUR/CLA (COLUNA C = "x")
export const DOCUMENTOS_BASE_CAMACARI: DocumentoBaseItem[] = [
  // --- DOCUMENTOS GERAIS E COMUNS (Coluna C: com "x" em todas as planilhas da SEDUR) ---
  { id: 1, itemSedur: '1.0', nome: 'Documento de identificação do requerente: RG (Pessoa Física) ou Contrato Social e RG dos sócios (Pessoa Jurídica)', obrigatorioPadrao: true },
  { id: 2, itemSedur: '5.0', nome: 'Cópia do CNPJ ativo e Inscrição Estadual, para pessoa jurídica', obrigatorioPadrao: true },
  { id: 3, itemSedur: '2.0', nome: 'Procuração do requerente com dados completos, caso a solicitação seja feita por terceiros', obrigatorioPadrao: false },
  { id: 4, itemSedur: '3.0', nome: 'Certidão de matrícula e ônus reais emitida pelo Cartório de Registro de Imóveis (RGI) OU comprovação de posse legítima / Contrato de Locação com firmas', obrigatorioPadrao: true },
  { id: 5, itemSedur: '4.0', nome: 'Certidão Negativa de Débitos Municipais e Imobiliários / IPTU (SEFAZ Camaçari)', obrigatorioPadrao: true },
  { id: 6, itemSedur: '6.0', nome: 'Consulta Prévia de Viabilidade Urbanística emitida pela SEDUR', obrigatorioPadrao: true },
  { id: 7, itemSedur: '7.0', nome: 'Requerimento de Licenciamento Ambiental assinado (disponível no SIS-SEDUR)', obrigatorioPadrao: true },
  { id: 8, itemSedur: '8.0', nome: 'Relatório de Caracterização do Empreendimento (RCE) (Modelo SEDUR disponível no SIS-SEDUR)', obrigatorioPadrao: true },
  { id: 9, itemSedur: '9.0', nome: 'Termo de Responsabilidade Ambiental - TRA (Modelo SEDUR disponível no SIS-SEDUR)', obrigatorioPadrao: true, dispensadoEmInexigibilidade: true },
  { id: 10, itemSedur: '10.0', nome: 'Planta georreferenciada de localização do empreendimento (vias de acesso, corpos d’água e áreas protegidas)', obrigatorioPadrao: true },
  { id: 11, itemSedur: '11.0', nome: 'Projeto Básico do empreendimento (Planta de Situação georreferenciada SIRGAS 2000)', obrigatorioPadrao: true },
  { id: 12, itemSedur: 'DAM', nome: 'Comprovantes de quitação bancária dos DAMs de abertura de processo e taxa ambiental', obrigatorioPadrao: true },

  // --- DOCUMENTOS ESPECÍFICOS DE LICENÇA SIMPLIFICADA (LAS) CLASSES 1 E 2 ---
  { 
    id: 13, 
    itemSedur: '12.0', 
    nome: 'Estudo Ambiental para Atividades de Impacto / Estudo de Pequeno Impacto (EPI), conforme Termo de Referência da SEDUR', 
    obrigatorioPadrao: false, 
    obrigatorioEmLas: true,
    dispensadoEmInexigibilidade: true 
  },
  { 
    id: 14, 
    itemSedur: '15.0', 
    nome: 'Mapa de Restrições Ambientais / Projeto Básico georreferenciado (SIRGAS 2000) com quadro de áreas e APPs', 
    obrigatorioPadrao: true // Marcado com "x" na Inexigibilidade e em todas as LAS
  },

  // --- ESPECÍFICOS: POSTO DE COMBUSTÍVEIS (Relação_doc_LAS_Posto_Combustível.xls) ---
  { 
    id: 15, 
    itemSedur: '16.0', 
    nome: 'Projeto Básico de equipamentos, sistemas de monitoramento, proteção, detecção de vazamentos, sistemas de drenagem e tanques de combustíveis (SASC) conforme Normas ABNT', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['POSTO_COMBUSTIVEL'], 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL'] 
  },
  { 
    id: 16, 
    itemSedur: '27.0', 
    nome: 'Plantas do sistema de coleta e tratamento de efluentes líquidos incluindo drenagem pluvial e águas contaminadas do posto (Caixa Separadora de Água e Óleo - CSAO)', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['POSTO_COMBUSTIVEL'], 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL'] 
  },

  // --- ESPECÍFICOS: MINERAÇÃO (Relação_doc_LAS_Mineração.xls) ---
  { 
    id: 17, 
    itemSedur: '23.0', 
    nome: 'Certidão sobre a situação do processo no Departamento Nacional de Produção Mineral (DNPM / ANM)', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['MINERACAO'], 
    tipologiasObrigatorias: ['MINERACAO'] 
  },
  { 
    id: 18, 
    itemSedur: '24.0', 
    nome: 'Alvará de Pesquisa do DNPM/ANM com relatório de pesquisa, Guia de Utilização de minério, Portaria de Lavra ou registro de licença', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['MINERACAO'], 
    tipologiasObrigatorias: ['MINERACAO'] 
  },
  { 
    id: 19, 
    itemSedur: '14.0', 
    nome: 'Levantamento topográfico (planialtimétrico/cadastral) georreferenciado UTM SIRGAS 2000 (curvas de nível de 1m)', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['MINERACAO'], 
    tipologiasObrigatorias: ['MINERACAO'] // Marcado com "x" especificamente na planilha de Mineração
  },
  { 
    id: 20, 
    itemSedur: '22.0', 
    nome: 'Documento comprobatório de propriedade ou posse do imóvel, ou autorização expressa do superficiário acompanhada do título de posse/propriedade', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['MINERACAO'], 
    tipologiasObrigatorias: ['MINERACAO'] 
  },
  { 
    id: 21, 
    itemSedur: '29.0', 
    nome: 'Programa de Gerenciamento de Risco (PGR), conforme norma técnica da Resolução CEPRAM nº 4.578/2017, com ART do responsável', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['MINERACAO'], 
    tipologiasObrigatorias: ['MINERACAO'] 
  },

  // --- ESPECÍFICOS: URBANÍSTICO E OBRAS (Relação_doc_LAS_Urbanístico.xls e Relação_doc_LAS_Obra.xls) ---
  { 
    id: 22, 
    itemSedur: '24.0', 
    nome: 'Carta de viabilidade de serviços de saneamento básico (EMBASA), energia elétrica (COELBA), de coleta de lixo e transporte (Prefeitura)', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['POSTO_COMBUSTIVEL', 'URBANISTICO', 'OBRA'], 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL', 'URBANISTICO', 'OBRA'] 
  },
  { 
    id: 23, 
    itemSedur: '25.0', 
    nome: 'Projetos de abastecimento de água e de esgotamento sanitário com memórias de cálculo aprovados pela EMBASA', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['POSTO_COMBUSTIVEL', 'URBANISTICO', 'OBRA'], 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL', 'URBANISTICO', 'OBRA'] 
  },
  { 
    id: 24, 
    itemSedur: '26.0', 
    nome: 'Projeto de drenagem de águas pluviais do empreendimento acompanhado da respectiva ART', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['URBANISTICO', 'OBRA'], 
    tipologiasObrigatorias: ['URBANISTICO', 'OBRA'] 
  },

  // --- ESPECÍFICOS: ESTAÇÃO RÁDIO BASE / ERB (Relação_doc_LAS_ERB.xls) ---
  { 
    id: 25, 
    itemSedur: 'ERB', 
    nome: 'Laudo Radiométrico Teórico com estimativa dos níveis máximos de densidade de potência e lóbulo principal das antenas (raio mín. 30 metros)', 
    obrigatorioPadrao: false, 
    somenteTipologias: ['ERB'], 
    tipologiasObrigatorias: ['ERB'] 
  },

  // --- PROGRAMAS AMBIENTAIS E RESÍDUOS SÓLIDOS (Com "x" na coluna C das LAS) ---
  { 
    id: 26, 
    itemSedur: '18.0', 
    nome: 'Plano de Gerenciamento de Resíduos Sólidos (PGRS) e/ou Plano de Resíduos da Construção Civil (PGRSCC)', 
    obrigatorioPadrao: false, 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL', 'MINERACAO', 'URBANISTICO', 'OBRA', 'ERB'] 
  },
  { 
    id: 27, 
    itemSedur: '17.0', 
    nome: 'Relatório de Detalhamento dos Programas Ambientais e/ou Programa de Educação Ambiental', 
    obrigatorioPadrao: false, 
    tipologiasObrigatorias: ['POSTO_COMBUSTIVEL', 'MINERACAO', 'URBANISTICO', 'OBRA'] 
  },

  // --- CONDICIONAIS (Sem "x" na coluna C em todas as planilhas - Exigíveis apenas "quando couber") ---
  { id: 28, itemSedur: '13.0', nome: 'Laudo geológico e hidrogeológico acompanhado de ART (quando couber)', obrigatorioPadrao: false },
  { id: 29, itemSedur: '20.0', nome: 'Outorga de direito de uso da água (INEMA) para captação subterrânea, poço ou intervenção hídrica (quando couber)', obrigatorioPadrao: false },
  { id: 30, itemSedur: '21.0', nome: 'Declaração de IAP protocolada no INEMA (quando houver interferência em APP ou Reserva Legal)', obrigatorioPadrao: false },
  { id: 31, itemSedur: '22.0', nome: 'Protocolo de requerimento da Autorização de Supressão de Vegetação (ASV) ou Portaria de ASV (quando couber)', obrigatorioPadrao: false },
  { id: 32, itemSedur: '23.0', nome: 'Comprovante de regularidade da Reserva Legal / CEFIR (quando imóvel rural)', obrigatorioPadrao: false },
  { id: 33, itemSedur: '27.0', nome: 'Projeto de paisagismo conforme termo de referência da SEDUR (quando couber)', obrigatorioPadrao: false },

  // --- ESPECÍFICOS DE RENOVAÇÃO (Art. 14 LC nº 1.876/2023) ---
  { id: 34, itemSedur: 'REN-1', nome: 'Cópia da Portaria / Certificado da Licença Ambiental Simplificada (LAS) anterior a renovar', obrigatorioPadrao: true, somenteRenovacao: true },
  { id: 35, itemSedur: 'REN-2', nome: 'Relatório Técnico Fotográfico de Cumprimento das Condicionantes da LAS anterior (com MTRs, laudos e notas)', obrigatorioPadrao: true, somenteRenovacao: true },
];

export const FUNDAMENTACAO_LEGAL = {
  codigoMeioAmbiente: 'Lei Complementar Municipal nº 1.876/2023 (Código de Meio Ambiente de Camaçari, Art. 53, § 2º e Anexo IV)',
  pddu: 'Lei Complementar Municipal nº 1.873/2023 (PDDU Camaçari)',
  codigoUrbanistico: 'Lei Complementar Municipal nº 1.874/2023 (Código Urbanístico de Camaçari)',
  decretoEstadual: 'Decreto Estadual da Bahia nº 14.024/2012',
  cepram: 'Resoluções CEPRAM nº 4.327/2013, nº 4.578/2017 e nº 4.579/2018'
};

// VALIDADOR ESTRITO DE OBRIGATORIEDADE SEGUINDO A COLUNA "C" DA SEDUR
export function verificarDocumentoObrigatorioSedur(
  doc: DocumentoBaseItem, 
  modalidade: ModalidadeLicenca, 
  tipologia: TipologiaAtividade = 'GERAL'
): boolean {
  if (doc.somenteRenovacao) {
    return modalidade === 'RENOVACAO_LAS';
  }

  if (modalidade === 'INEXIGIBILIDADE') {
    if (doc.dispensadoEmInexigibilidade) return false;
    return doc.obrigatorioPadrao;
  }

  if (modalidade === 'LAS' || modalidade === 'RENOVACAO_LAS') {
    if (doc.obrigatorioEmLas) return true;
    if (doc.tipologiasObrigatorias && doc.tipologiasObrigatorias.includes(tipologia)) {
      return true;
    }
  }

  return doc.obrigatorioPadrao;
}

export function detectarTipologiaPorCnaes(cnaes: CnaeItem[]): TipologiaAtividade {
  if (!cnaes || cnaes.length === 0) return 'GERAL';

  const texto = cnaes
    .map(c => `${c.codigo} ${c.descricao}`)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (texto.includes('4731') || texto.includes('4732') || texto.includes('4681') || texto.includes('combustivel') || texto.includes('posto de gasolina') || texto.includes('trr')) {
    return 'POSTO_COMBUSTIVEL';
  }

  if (texto.includes('0810') || texto.includes('0891') || texto.includes('0892') || texto.includes('0899') || texto.includes('0710') || texto.includes('mineracao') || texto.includes('extracao') || texto.includes('areal') || texto.includes('pedreira') || texto.includes('brita') || texto.includes('lavra')) {
    return 'MINERACAO';
  }

  if (texto.includes('6110') || texto.includes('6120') || texto.includes('6130') || texto.includes('6190') || texto.includes('telefonia movel') || texto.includes('estacao radio base') || texto.includes('antena')) {
    return 'ERB';
  }

  if ((texto.includes('6810') && (texto.includes('loteamento') || texto.includes('imoveis proprios'))) || texto.includes('4110') || texto.includes('loteamento') || texto.includes('parcelamento do solo') || texto.includes('condominio urbanistico')) {
    return 'URBANISTICO';
  }

  if (texto.includes('4120') || texto.includes('4211') || texto.includes('4212') || texto.includes('4213') || texto.includes('4221') || texto.includes('4299') || texto.includes('4311') || texto.includes('4313') || texto.includes('construcao de edificios') || texto.includes('terraplenagem')) {
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

  if (b.includes('polo') || b.includes('petroquimico') || b.includes('industrial') || b.includes('copec')) return 'ZPIC';
  if (b.includes('areal') || b.includes('costa') || b.includes('zdc 5') || b.includes('zdc5')) return 'ZDC 5';
  if (b.includes('guarajuba') || b.includes('itacimirim') || b.includes('arembepe') || b.includes('jacuipe') || b.includes('monte gordo') || b.includes('busca vida') || b.includes('interlagos')) return 'ZTR';
  if (b.includes('abrantes') || b.includes('jaua') || b.includes('areias') || b.includes('catu') || b.includes('machadinho') || b.includes('buris')) return 'ZOUC 2';
  if (b.includes('cascalheira') || b.includes('parafuso') || b.includes('estrada do coco') || b.includes('ba-099') || b.includes('ba-535') || b.includes('ba 093') || b.includes('ba-093')) return 'ZDC 3';
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
  const resultado: ResultadoParsingSisSedur = { documentos_identificados: [] };
  if (!textoBruto || textoBruto.trim() === '') return resultado;

  const textoLimpo = textoBruto.replace(/\u00a0/g, ' ').replace(/\r\n/g, '\n');
  const linhas = textoLimpo.split('\n').map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const linhaNorm = linha.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (/^cnpj|^cpf\/cnpj|^inscri[cç][aã]o\s+federal/i.test(linhaNorm)) {
      let valor = linha.replace(/^[^:]*:\s*/, '').trim();
      if (!valor && i + 1 < linhas.length) valor = linhas[i + 1].trim();
      const digitos = valor.replace(/\D/g, '');
      if (digitos.length === 14) resultado.cnpj = formatarCnpj(digitos);
    }

    if (/^interessado|^requerente|^razao\s+social/i.test(linhaNorm)) {
      let valor = linha.replace(/^[^:]*:\s*/, '').trim();
      if (!valor && i + 1 < linhas.length) valor = linhas[i + 1].trim();
      if (valor) resultado.interessado = valor;
    }

    if (/processo/i.test(linhaNorm)) {
      const trecho = linha + ' ' + (linhas[i + 1] || '');
      const matchProc = trecho.match(/\d{4,6}[./]\d{2}[./]\d{2}[./]\d{3,5}[./]\d{4}/);
      if (matchProc) resultado.numero_processo = matchProc[0].replace(/\//g, '.');
    }

    if (/^endereco|^endereço|^localizacao/i.test(linhaNorm)) {
      let valor = linha.replace(/^[^:]*:\s*/, '').trim();
      if (!valor && i + 1 < linhas.length) valor = linhas[i + 1].trim();
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

    if (/^assunto|^servico|^serviço/i.test(linhaNorm)) {
      let valor = linha.replace(/^[^:]*:\s*/, '').trim();
      if (!valor && i + 1 < linhas.length) valor = linhas[i + 1].trim();
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

  if (!resultado.cnpj) {
    const matchCnpjGlobal = textoLimpo.match(/\b\d{2}[\s.]?\d{3}[\s.]?\d{3}[\s./]?\d{4}[\s.-]?\d{2}\b/);
    if (matchCnpjGlobal) {
      const digitos = matchCnpjGlobal[0].replace(/\D/g, '');
      if (digitos.length === 14) resultado.cnpj = formatarCnpj(digitos);
    }
  }

  if (!resultado.numero_processo) {
    const matchP = textoLimpo.match(/(\d{4,6}[./]\d{2}[./]\d{2}[./]\d{3,5}[./]\d{4})/);
    if (matchP) resultado.numero_processo = matchP[0].replace(/\//g, '.');
  }

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
  if (/epi|estudo ambiental para atividades de pequeno impacto/.test(normalizado)) docs.add(13);
  if (/mapa de restricoes ambientais|mapa de restricoes/.test(normalizado)) docs.add(14);
  if (/sasc|equipamentos e sistemas de monitoramento|tanques/.test(normalizado)) docs.add(15);
  if (/csao|separadora de agua e oleo|efluentes/.test(normalizado)) docs.add(16);
  if (/dnpm|anm|processo minerario/.test(normalizado)) { docs.add(17); docs.add(18); }
  if (/topografico|curvas de nivel/.test(normalizado)) docs.add(19);
  if (/superficiario/.test(normalizado)) docs.add(20);
  if (/pgr|gerenciamento de risco/.test(normalizado)) docs.add(21);
  if (/carta de viabilidade|embasa.*coelba/.test(normalizado)) docs.add(22);
  if (/aprovados pela embasa|esgotamento sanitario/.test(normalizado)) docs.add(23);
  if (/drenagem de aguas pluviais|drenagem/.test(normalizado)) docs.add(24);
  if (/laudo radiometrico|radiometrico/.test(normalizado)) docs.add(25);
  if (/pgrs|pgrscc/.test(normalizado)) docs.add(26);
  if (/programas ambientais|educacao ambiental/.test(normalizado)) docs.add(27);
  if (/laudo geologico/.test(normalizado)) docs.add(28);
  if (/outorga/.test(normalizado)) docs.add(29);
  if (/iap|inema/.test(normalizado)) docs.add(30);
  if (/asv|supressao/.test(normalizado)) docs.add(31);
  if (/reserva legal|cefir/.test(normalizado)) docs.add(32);
  if (/paisagismo/.test(normalizado)) docs.add(33);
  if (/licenca anterior|las anterior|portaria/.test(normalizado)) docs.add(34);
  if (/condicionantes|mtr|sinir/.test(normalizado)) docs.add(35);

  resultado.documentos_identificados = Array.from(docs);
  return resultado;
}
