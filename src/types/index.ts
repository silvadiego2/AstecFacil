export type ModalidadeLicenca = 'DISPENSA' | 'LAS' | 'INEXIGIBILIDADE';
export type StatusParecer = 'DEFERIMENTO' | 'INDEFERIMENTO' | 'DILIGENCIA';

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

export interface DocumentoChecklistItem {
  id: number;
  nome: string;
  obrigatorio: boolean;
  conferido: boolean;
  observacao?: string;
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
  modalidade: ModalidadeLicenca;
  cnae_principal: CnaeItem;
  cnaes_secundarios: CnaeItem[];
  documentos_conferidos: number[];
  status_parecer: StatusParecer;
  texto_parecer: string;
  possui_atividade_industrial: boolean;
  declaracao_artesanal_bancada: boolean;
}
