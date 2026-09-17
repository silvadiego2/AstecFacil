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
  { valor: 'ZOUC 1', label: 'ZOUC 1 - Zona de Ocupação Urbana Consolidada 1' },
  { valor: 'ZOUC 2', label: 'ZOUC 2 - Zona de Ocupação Urbana Consolidada 2' },
  { valor: 'ZDC 1', label: 'ZDC 1 - Zona de Desenvolvimento e Comércio 1' },
  { valor: 'ZDC 2', label: 'ZDC 2 - Zona de Desenvolvimento e Comércio 2' },
  { valor: 'ZDC 3', label: 'ZDC 3 - Zona de Desenvolvimento e Comércio 3' },
  { valor: 'ZDC 4', label: 'ZDC 4 - Zona de Desenvolvimento e Comércio 4' },
  { valor: 'ZDC 5', label: 'ZDC 5 - Zona de Desenvolvimento e Comércio 5' },
  { valor: 'ZPIC', label: 'ZPIC - Zona de Polo Industrial de Camaçari' },
  { valor: 'ZEIS', label: 'ZEIS - Zona Especial de Interesse Social' },
  { valor: 'ZTR', label: 'ZTR - Zona Turística e Residencial (Orla)' },
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
  // Documentos Condicionais / Não Impeditivos para DLA/Inexigibilidade:
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
  // Documentos Exclusivos de Renovação de LAS:
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
