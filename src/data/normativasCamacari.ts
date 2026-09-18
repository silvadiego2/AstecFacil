// src/data/normativasCamacari.ts

export interface ZoneamentoItem {
  valor: string;
  label: string;
}

export interface DocumentoBaseItem {
  id: number;
  nome: string;
  obrigatorio: boolean;
  somenteRenovacao?: boolean;
}

export const ZONEAMENTOS_CAMACARI: ZoneamentoItem[] = [
  { valor: 'ZOUC 1', label: 'ZOUC 1 - Zona de Ocupação Urbana Consolidada 1 (Sede)' },
  { valor: 'ZOUC 2', label: 'ZOUC 2 - Zona de Ocupação Urbana Consolidada 2 (Orla e Expansão)' },
  { valor: 'ZDC 1', label: 'ZDC 1 - Zona de Desenvolvimento e Comércio 1' },
  { valor: 'ZDC 2', label: 'ZDC 2 - Zona de Desenvolvimento e Comércio 2' },
  { valor: 'ZDC 3', label: 'ZDC 3 - Zona de Desenvolvimento e Comércio 3 (Corredores Rodoviários)' },
  { valor: 'ZDC 4', label: 'ZDC 4 - Zona de Desenvolvimento e Comércio 4' },
  { valor: 'ZDC 5', label: 'ZDC 5 - Zona de Desenvolvimento e Comércio 5' },
  { valor: 'ZPIC', label: 'ZPIC - Zona de Polo Industrial de Camaçari' },
  { valor: 'ZEIS', label: 'ZEIS - Zona Especial de Interesse Social' },
  { valor: 'ZTR', label: 'ZTR - Zona Turística e Residencial (Litoral / Orla)' },
  { valor: 'ZIT', label: 'ZIT - Zona de Interesse Turístico' },
  { valor: 'ZEU', label: 'ZEU - Zona de Expansão Urbana' },
  { valor: 'ZPA', label: 'ZPA - Zona de Proteção Ambiental' },
];

export const DOCUMENTOS_BASE_CAMACARI: DocumentoBaseItem[] = [
  { 
    id: 1, 
    nome: 'Requerimento padrão assinado pelo responsável legal ou procurador constituído', 
    obrigatorio: true 
  },
  { 
    id: 2, 
    nome: 'Comprovante de Inscrição e Situação Cadastral do CNPJ (ativo)', 
    obrigatorio: true 
  },
  { 
    id: 3, 
    nome: 'Contrato Social consolidado ou última alteração contratual registrada na JUCEB', 
    obrigatorio: true 
  },
  { 
    id: 4, 
    nome: 'Documento oficial de identificação dos sócios/administradores (RG/CPF ou CNH-e)', 
    obrigatorio: true 
  },
  { 
    id: 5, 
    nome: 'Comprovação de Posse/Uso do Imóvel: Contrato de Locação vigente com firmas OU Escritura/Certidão de Inteiro Teor do RGI (se proprietário)', 
    obrigatorio: true 
  },
  { 
    id: 6, 
    nome: 'Certidão Negativa de Débitos Municipais e Imobiliários / IPTU (SEFAZ Camaçari)', 
    obrigatorio: true 
  },
  { 
    id: 7, 
    nome: 'Consulta Prévia de Viabilidade Urbanística Deferida pela SEDUR/REDESIM (ou Alvará anterior se em atividade)', 
    obrigatorio: true 
  },
  { 
    id: 8, 
    nome: 'Relatório de Caracterização do Empreendimento (RCE) detalhado e assinado', 
    obrigatorio: true 
  },
  { 
    id: 9, 
    nome: 'Arquivo georreferenciado em formato KML/KMZ (SIRGAS 2000) e Croqui de Acesso', 
    obrigatorio: true 
  },
  { 
    id: 10, 
    nome: 'Certificado de Licença do Corpo de Bombeiros Militar (CLCB ou AVCB vigente)', 
    obrigatorio: true 
  },
  { 
    id: 11, 
    nome: 'Comprovantes de quitação bancária dos DAMs (Abertura de Processo e Taxa de Licenciamento)', 
    obrigatorio: true 
  },
  { 
    id: 12, 
    nome: 'Comprovante de abastecimento de água e esgotamento sanitário (EMBASA) ou solução própria (fossa/outorga)', 
    obrigatorio: false 
  },
  { 
    id: 13, 
    nome: 'Comprovante de energia elétrica (Neoenergia Coelba) — do imóvel, condomínio ou locador', 
    obrigatorio: false 
  },
  { 
    id: 14, 
    nome: 'Alvará Sanitário emitido pela Vigilância Sanitária Municipal (SESAU/VISA), se aplicável', 
    obrigatorio: false 
  },
  { 
    id: 15, 
    nome: 'Parecer Técnico ou Relatório de Vistoria da DIRAM/CLA (quando realizado pelo órgão)', 
    obrigatorio: false 
  },
  { 
    id: 16, 
    nome: 'Cópia da Portaria / Certificado da Licença Ambiental Simplificada (LAS) anterior a renovar', 
    obrigatorio: true, 
    somenteRenovacao: true 
  },
  { 
    id: 17, 
    nome: 'Relatório Técnico Fotográfico de Cumprimento das Condicionantes da LAS anterior (MTR, laudos, notas)', 
    obrigatorio: true, 
    somenteRenovacao: true 
  },
];

export const PALAVRAS_CHAVE_INDUSTRIA: string[] = [
  'fabricacao', 'fabricação', 'producao', 'produção', 'usinagem', 'tintas',
  'corte termico', 'corte térmico', 'alimentos', 'metalurgica', 'metalúrgica',
  'quimica', 'química', 'plastico', 'plástico', 'torno', 'solda', 'revestimento'
];

export const FUNDAMENTACAO_LEGAL = {
  codigoMeioAmbiente: 'Lei Complementar Municipal nº 1.876/2023 (Código de Meio Ambiente de Camaçari, Anexo IV e Art. 14)',
  pddu: 'Lei Complementar Municipal nº 1.873/2023 (PDDU Camaçari)',
  codigoUrbanistico: 'Lei Complementar Municipal nº 1.874/2023 (Código Urbanístico de Camaçari)',
  decretoEstadual: 'Decreto Estadual da Bahia nº 14.024/2012',
  cepram: 'Resoluções CEPRAM nº 4.327/2013 e nº 4.579/2018'
};

// ============================================================================
// 1. AUTOCOMPLETAR DO ZONEAMENTO PELO BAIRRO (PDDU - LC nº 1.873/2023)
// ============================================================================
export function inferirZoneamentoPorBairro(bairro: string): string {
  if (!bairro) return 'ZOUC 1';
  
  const b = bairro
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Polo Petroquímico e Complexo Industrial
  if (
    b.includes('polo') || 
    b.includes('petroquimico') || 
    b.includes('industrial') || 
    b.includes('copec') || 
    b.includes('complexo')
  ) {
    return 'ZPIC';
  }

  // Litoral e Orla Turística / Residencial
  if (
    b.includes('guarajuba') ||
    b.includes('itacimirim') ||
    b.includes('arembepe') ||
    b.includes('jacuipe') ||
    b.includes('monte gordo') ||
    b.includes('busca vida') ||
    b.includes('interlagos') ||
    b.includes('barra do pojuca') ||
    b.includes('genipabu')
  ) {
    return 'ZTR';
  }

  // Vetor Orla Sul e Abrantes
  if (
    b.includes('abrantes') ||
    b.includes('jaua') ||
    b.includes('areias') ||
    b.includes('catu') ||
    b.includes('machadinho') ||
    b.includes('buris') ||
    b.includes('sucupio')
  ) {
    return 'ZOUC 2';
  }

  // Corredores Rodoviários e Zonas Comerciais
  if (
    b.includes('cascalheira') ||
    b.includes('parafuso') ||
    b.includes('estrada do coco') ||
    b.includes('rodovia') ||
    b.includes('ba-099') ||
    b.includes('ba-535') ||
    b.includes('canal de trafego')
  ) {
    return 'ZDC 3';
  }

  // Bairros da Sede Urbana Consolidada (Padrão ZOUC 1)
  return 'ZOUC 1';
}

// ============================================================================
// 2. PARSER RESILIENTE DO SIS-SEDUR COM DETECÇÃO AVANÇADA DE CNPJ
// ============================================================================
export interface ResultadoParsingSisSedur {
  numero_processo?: string;
  cnpj?: string;
  interessado?: string;
  endereco?: string;
  bairro?: string;
  area_m2?: number;
  coordenadas?: string;
  zona_sugerida?: string;
  documentos_identificados: number[];
}

export function parseTextoDoSisSedur(texto: string): ResultadoParsingSisSedur {
  const resultado: ResultadoParsingSisSedur = {
    documentos_identificados: [],
  };

  if (!texto || texto.trim() === '') return resultado;

  const textoLimpo = texto.replace(/\r\n/g, '\n');

  // 1. Extração do Número do Processo SIS-SEDUR
  const regexProcesso = /(\d{4,6}[./]\d{2}[./]\d{2}[./]\d{3}[./]\d{4}|\d{5}\.\d{2}\.\d{2}\.\d{3}\.\d{4})/;
  const matchProcesso = textoLimpo.match(regexProcesso);
  if (matchProcesso) {
    resultado.numero_processo = matchProcesso[0].replace(/\//g, '.');
  }

  // 2. Extração ULTRA-RESILIENTE de CNPJ (Formatado, com Rótulo ou Números Soltos)
  let cnpjEncontrado: string | null = null;

  // 2a. Busca por CNPJ formatado tradicional (XX.XXX.XXX/XXXX-XX)
  const matchFormatado = textoLimpo.match(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/);
  if (matchFormatado) {
    cnpjEncontrado = matchFormatado[0];
  }

  // 2b. Busca por rótulo (CNPJ, CPF/CNPJ, Inscrição Federal)
  if (!cnpjEncontrado) {
    const matchRotulo = textoLimpo.match(/(?:cnpj|cpf\/cnpj|cnpj\/cpf|inscri[cç][aã]o\s+federal|doc(?:\.|umento)?)\s*[:=-]?\s*([0-9.\-\/\s]{11,20})/i);
    if (matchRotulo) {
      const digitos = matchRotulo[1].replace(/\D/g, '');
      if (digitos.length === 14) {
        cnpjEncontrado = `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12, 14)}`;
      }
    }
  }

  // 2c. Busca por qualquer sequência contínua de 14 dígitos no texto
  if (!cnpjEncontrado) {
    const match14 = textoLimpo.match(/\b\d{14}\b/);
    if (match14) {
      const d = match14[0];
      cnpjEncontrado = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
    }
  }

  if (cnpjEncontrado) {
    resultado.cnpj = cnpjEncontrado;
  }

  // 3. Extração da Razão Social / Interessado
  const regexInteressado = /(?:interessado|requerente|razao social|razão social|empresa):\s*([^\n\r,]+)/i;
  const matchInteressado = textoLimpo.match(regexInteressado);
  if (matchInteressado) {
    resultado.interessado = matchInteressado[1].trim();
  }

  // 4. Extração da Área em m²
  const regexArea = /(?:area|área|area construida|área construída|area util|área útil):\s*([\d.,]+)\s*(?:m2|m²)?/i;
  const matchArea = textoLimpo.match(regexArea);
  if (matchArea) {
    const rawNum = matchArea[1].replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) {
      resultado.area_m2 = parsed;
    }
  }

  // 5. Extração do Bairro e Endereço
  const regexBairro = /(?:bairro|distrito):\s*([^\n\r,]+)/i;
  const matchBairro = textoLimpo.match(regexBairro);
  if (matchBairro) {
    resultado.bairro = matchBairro[1].trim();
    resultado.zona_sugerida = inferirZoneamentoPorBairro(resultado.bairro);
  }

  const regexEndereco = /(?:endereco|endereço|logradouro|localizacao|localização):\s*([^\n\r]+)/i;
  const matchEndereco = textoLimpo.match(regexEndereco);
  if (matchEndereco) {
    resultado.endereco = matchEndereco[1].trim();
  }

  // 6. Extração de Coordenadas
  const regexCoord = /(?:coordenadas|sirgas|utm|lat\/long|latitude):\s*([^\n\r]+)/i;
  const matchCoord = textoLimpo.match(regexCoord);
  if (matchCoord) {
    resultado.coordenadas = matchCoord[1].trim();
  }

  // 7. LEITURA DOS TÍTULOS DOS DOCUMENTOS ANEXADOS
  const normalizado = textoLimpo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const docsEncontrados = new Set<number>();

  if (/requerimento|solicitacao|formulario padrao/.test(normalizado)) docsEncontrados.add(1);
  if (/cartao cnpj|cartao do cnpj|comprovante cnpj|situacao cadastral/.test(normalizado)) docsEncontrados.add(2);
  if (/contrato social|alteracao contratual|estatuto|juceb/.test(normalizado)) docsEncontrados.add(3);
  if (/\brg\b|\bcpf\b|\bcnh\b|identificacao|identidade dos socios/.test(normalizado)) docsEncontrados.add(4);
  if (/locacao|locaçao|aluguel|escritura|registro de imoveis|certidao de inteiro teor|\brgi\b|matricula/.test(normalizado)) docsEncontrados.add(5);
  if (/iptu|certidao negativa|debitos municipais|tributos municipais|\bsefaz\b/.test(normalizado)) docsEncontrados.add(6);
  if (/viabilidade|consulta previa|uso do solo|alvara de localizacao|alvara de funcionamento/.test(normalizado)) docsEncontrados.add(7);
  if (/\brce\b|caracterizacao do empreendimento|relatorio de caracterizacao/.test(normalizado)) docsEncontrados.add(8);
  if (/\bkml\b|\bkmz\b|croqui|georreferenciamento|sirgas 2000/.test(normalizado)) docsEncontrados.add(9);
  if (/bombeiro|bombeiros|\bavcb\b|\bclcb\b|cbmba/.test(normalizado)) docsEncontrados.add(10);
  if (/\bdam\b|taxa de abertura|taxa de licenciamento|comprovante de pagamento|quitacao bancaria/.test(normalizado)) docsEncontrados.add(11);
  if (/embasa|abastecimento de agua|esgotamento|fossa septica/.test(normalizado)) docsEncontrados.add(12);
  if (/coelba|neoenergia|energia eletrica|conta de luz/.test(normalizado)) docsEncontrados.add(13);
  if (/sanitario|sanitaria|vigilancia|sesau|\bvisa\b/.test(normalizado)) docsEncontrados.add(14);
  if (/vistoria|relatorio de vistoria|fiscalizacao|\bdiram\b|\bcla\b/.test(normalizado)) docsEncontrados.add(15);
  if (/licenca anterior|licenca a renovar|las anterior|portaria sedur|portaria anterior/.test(normalizado)) docsEncontrados.add(16);
  if (/condicionantes|cumprimento das condicionantes|\bmtr\b|\bsinir\b/.test(normalizado)) docsEncontrados.add(17);

  resultado.documentos_identificados = Array.from(docsEncontrados);

  return resultado;
}
