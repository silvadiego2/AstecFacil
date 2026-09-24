// src/types/index.ts

export type ModalidadeLicenca = 'DISPENSA' | 'LAS' | 'INEXIGIBILIDADE' | 'RENOVACAO_LAS';
export type StatusParecer = 'DEFERIMENTO' | 'INDEFERIMENTO' | 'DILIGENCIA';
export type TipoSolicitacao = 'NOVA_LICENCA' | 'RENOVACAO';
export type DestinatarioParecer = 'CLA' | 'CLU' | 'GABINETE';

export type TipologiaAtividade = 
  | 'GERAL'
  | 'POSTO_COMBUSTIVEL'
  | 'MINERACAO'
  | 'URBANISTICO'
  | 'OBRA'
  | 'ERB';

export interface CnaeItem {
  codigo: number | string;
  descricao: string;
}

export interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  descricao_tipo_de_logradouro?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  cnaes_secundarios: CnaeItem[];
}

export interface ProcessoFormData {
  id?: number;
  numero_processo: string;
  interessado: string;
  cnpj: string;
  endereco: string;
  bairro: string;
  cep?: string;
  coordenadas: string;
  zona_urbanistica: string;
  area_m2: number;
  tipoSolicitacao: TipoSolicitacao;
  numeroLicencaAnterior?: string;
  modalidade: ModalidadeLicenca;
  tipologia_atividade: TipologiaAtividade;
  destinatario_parecer: DestinatarioParecer;
  cnae_principal: CnaeItem;
  cnaes_secundarios: CnaeItem[];
  documentos_conferidos: number[];
  status_parecer: StatusParecer;
  texto_parecer: string;
  possui_atividade_industrial: boolean;
  declaracao_artesanal_bancada: boolean;
}

// TIPOS PARA O MÓDULO DE COMUNICAÇÃO EXTERNA E PRAZOS
export interface DocumentoNotificacao {
  id: string;
  nome: string;
  entregue: boolean;
  data_entrega?: string; // YYYY-MM-DD
}

export type StatusPrazo = 'EM_ANDAMENTO' | 'PRAZO_CRITICO' | 'EXPIRADO' | 'CUMPRIDO' | 'DEVOLVIDO';

export interface ComunicacaoExterna {
  id: string;
  numero_processo: string;
  interessado: string;
  setor_origem: string; // Ex: CLA, CLU, GABINETE
  data_envio: string; // Data início (YYYY-MM-DD)
  prazo_dias: number; // Ex: 30, 60
  data_limite: string; // Prazo fatal (YYYY-MM-DD)
  documentos: DocumentoNotificacao[];
  observacoes?: string;
  created_at: string;
}
