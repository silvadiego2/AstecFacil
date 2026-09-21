// src/data/normativasCamacari.ts
import { TipoSolicitacao, ModalidadeLicenca } from '../types';

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
  { id: 1, nome: 'Requerimento padrão assinado pelo responsável legal ou procurador constituído', obrigatorio: true },
  { id: 2, nome: 'Comprovante de Inscrição e Situação Cadastral do CNPJ (ativo)', obrigatorio: true },
  { id: 3, nome: 'Contrato Social consolidado ou última alteração contratual registrada na JUCEB', obrigatorio: true },
  { id: 4, nome: 'Documento oficial de identificação dos sócios/administradores (RG/CPF ou CNH-e)', obrigatorio: true },
  { id: 5, nome: 'Comprovação de Posse/Uso do Imóvel: Contrato de Locação vigente com firmas OU Escritura/Certidão de Inteiro Teor do RGI (se proprietário)', obrigatorio: true },
  { id: 6, nome: 'Certidão Negativa de Débitos Municipais e Imobiliários / IPTU (SEFAZ Camaçari)', obrigatorio: true },
  { id: 7, nome: 'Consulta Prévia de Viabilidade Urbanística Deferida pela SEDUR/REDESIM (ou Alvará anterior se em atividade)', obrigatorio: true },
  { id: 8, nome: 'Relatório de Caracterização do Empreendimento (RCE) detalhado e assinado', obrigatorio: true },
  { id: 9, nome: 'Arquivo georreferenciado em formato KML/KMZ (SIRGAS 2000) e Croqui de Acesso', obrigatorio: true },
  { id: 10, nome: 'Certificado de Licença do Corpo de Bombeiros Militar (CLCB ou AVCB vigente)', obrigatorio: true },
  { id: 11, nome: 'Comprovantes de quitação bancária dos DAMs (Abertura de Processo e Taxa de Licenciamento)', obrigatorio: true },
  { id: 12, nome: 'Comprovante de abastecimento de água e esgotamento sanitário (EMBASA) ou solução própria (fossa/outorga)', obrigatorio: false },
  { id: 13, nome: 'Comprovante de energia elétrica (Neoenergia Coelba) — do imóvel, condomínio ou locador', obrigatorio: false },
  { id: 14, nome: 'Alvará Sanitário emitido pela Vigilância Sanitária Municipal (SESAU/VISA), se aplicável', obrigatorio: false },
  { id: 15, nome: 'Parecer Técnico ou Relatório de Vistoria da DIRAM/CLA (quando realizado pelo órgão)', obrigatorio: false },
  { id: 16, nome: 'Cópia da Portaria / Certificado da Licença Ambiental Simplificada (LAS) anterior a renovar', obrigatorio: true, somenteRenovacao: true },
  { id: 17, nome: 'Relatório Técnico Fotográfico de Cumprimento das Condicionantes da LAS anterior (MTR, laudos, notas)', obrigatorio: true, somenteRenovacao: true },
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
  const normalizado = textoLimpo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Natureza da Demanda
  if (/renovacao|renovaçao|renovação|\brlas\b/.test(normalizado)) {
    resultado.tipoSolicitacao = 'RENOVACAO';
    resultado.modalidade = 'RENOVACAO_LAS';
  } else if (/dispensa|\bdla\b/.test(normalizado)) {
    resultado.tipoSolicitacao = 'NOVA_LICENCA';
    resultado.modalidade = 'DISPENSA';
  } else if (/inexigibilidade/.test(normalizado)) {
    resultado.tipoSolicitacao = 'NOVA_LICENCA';
    resultado.modalidade = 'INEXIGIBILIDADE';
  } else if (/simplificada|\blas\b/.test(normalizado)) {
    resultado.tipoSolicitacao = 'NOVA_LICENCA';
    resultado.modalidade = 'LAS';
  }

  // 2. Número do Processo (suporta 3, 4 ou 5 dígitos no 4º bloco: ex: 02611.22.09.1073.2026)
  const regexProcesso = /(\d{4,6}[./]\d{2}[./]\d{2}[./]\d{3,5}[./]\d{4})/;
  const matchProcesso = textoLimpo.match(regexProcesso);
  if (matchProcesso) {
    resultado.numero_processo = matchProcesso[0].replace(/\//g, '.');
  }

  // 3. CNPJ - Captura mesmo com quebra de linha após rótulo ou números soltos
  let cnpjAchado: string | null = null;
  const matchComMascara = textoLimpo.match(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/);
  if (matchComMascara) {
    cnpjAchado = matchComMascara[0];
  } else {
    // Busca 14 dígitos após rótulos mesmo que haja quebra de linha
    const matchAposRotulo = textoLimpo.match(/(?:cnpj|cpf\/cnpj|inscri[cç][aã]o)[\s\S]{0,30}?(\d{2}[\s.]?\d{3}[\s.]?\d{3}[\s./]?\d{4}[\s.-]?\d{2})/i);
    if (matchAposRotulo) {
      const digitos = matchAposRotulo[1].replace(/\D/g, '');
      if (digitos.length === 14) {
        cnpjAchado = formatarCnpj(digitos);
      }
    }
  }

  if (!cnpjAchado) {
    const match14 = textoLimpo.match(/\b\d{14}\b/);
    if (match14) {
      cnpjAchado = formatarCnpj(match14[0]);
    }
  }

  if (cnpjAchado) {
    resultado.cnpj = cnpjAchado;
  }

  // 4. Interessado / Requerente (captura com ou sem quebra de linha após rótulo)
  const matchInteressado = textoLimpo.match(/(?:interessado|requerente|razao social|razão social)[\s\S]{0,25}?:[\s\n]*([^\n\r,;]+)/i);
  if (matchInteressado && matchInteressado[1].trim()) {
    resultado.interessado = matchInteressado[1].trim();
  }

  // 5. Endereço e Bairro
  const matchEndereco = textoLimpo.match(/(?:endereco|endereço|localizacao|localização)[\s\S]{0,20}?:[\s\n]*([^\n\r]+)/i);
  if (matchEndereco && matchEndereco[1].trim()) {
    resultado.endereco = matchEndereco[1].trim();
  }

  const matchBairro = textoLimpo.match(/(?:bairro|distrito)[\s\S]{0,20}?:[\s\n]*([^\n\r,;]+)/i);
  if (matchBairro && matchBairro[1].trim()) {
    resultado.bairro = matchBairro[1].trim();
    resultado.zona_sugerida = inferirZoneamentoPorBairro(resultado.bairro);
  }

  // 6. Área m²
  const matchArea = textoLimpo.match(/(?:area|área|area construida|área construída)[\s\S]{0,20}?:[\s\n]*([\d.,]+)/i);
  if (matchArea) {
    const parsed = parseFloat(matchArea[1].replace(/\./g, '').replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) resultado.area_m2 = parsed;
  }

  // 7. Documentos Anexados
  const docsEncontrados = new Set<number>();
  if (/requerimento|solicitacao|formulario/.test(normalizado)) docsEncontrados.add(1);
  if (/cartao cnpj|cartao do cnpj|comprovante cnpj|situacao cadastral/.test(normalizado)) docsEncontrados.add(2);
  if (/contrato social|alteracao contratual|estatuto|juceb/.test(normalizado)) docsEncontrados.add(3);
  if (/\brg\b|\bcpf\b|\bcnh\b|identificacao|identidade/.test(normalizado)) docsEncontrados.add(4);
  if (/locacao|locaçao|aluguel|escritura|rgi|matricula/.test(normalizado)) docsEncontrados.add(5);
  if (/iptu|certidao negativa|debitos municipais|sefaz/.test(normalizado)) docsEncontrados.add(6);
  if (/viabilidade|consulta previa|alvara/.test(normalizado)) docsEncontrados.add(7);
  if (/rce|caracterizacao do empreendimento/.test(normalizado)) docsEncontrados.add(8);
  if (/kml|kmz|croqui|georreferenciamento/.test(normalizado)) docsEncontrados.add(9);
  if (/bombeiro|bombeiros|avcb|clcb/.test(normalizado)) docsEncontrados.add(10);
  if (/dam|taxa de abertura|taxa de licenciamento|quitacao/.test(normalizado)) docsEncontrados.add(11);
  if (/embasa|abastecimento|esgoto/.test(normalizado)) docsEncontrados.add(12);
  if (/coelba|neoenergia|luz/.test(normalizado)) docsEncontrados.add(13);
  if (/sanitario|sanitaria|vigilancia|visa/.test(normalizado)) docsEncontrados.add(14);
  if (/vistoria|fiscalizacao|diram/.test(normalizado)) docsEncontrados.add(15);
  if (/licenca anterior|las anterior|portaria/.test(normalizado)) docsEncontrados.add(16);
  if (/condicionantes|mtr|sinir/.test(normalizado)) docsEncontrados.add(17);

  resultado.documentos_identificados = Array.from(docsEncontrados);
  return resultado;
}
