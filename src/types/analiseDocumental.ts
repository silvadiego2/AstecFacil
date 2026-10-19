// src/types/analiseDocumental.ts
export type StatusConformidadeDoc = 'CONFORME' | 'PENDENTE' | 'RESSALVA' | 'NAO_APLICAVEL';

export interface DocumentoAnexado {
  id: string;
  arquivoNome: string;
  tamanhoBytes: number;
  tipoMime: string;
  dataUpload: string;
  // Classificação automática ou manual
  categoriaIdentificada?: string;
  itemChecklistId?: string;
  statusConformidade: StatusConformidadeDoc;
  observacoesAnalise: string;
}

export interface ResultadoAuditoriaSedur {
  totalAnexados: number;
  totalObrigatorios: number;
  atendidosObrigatorios: number;
  pendentesObrigatorios: string[];
  ressalvasIdentificadas: string[];
  aptoParaDeferimento: boolean;
  encaminhamentoSugerido: 'DEFERIMENTO' | 'DILIGENCIA_EXTERNA' | 'INDEFERIMENTO';
  fundamentacaoLegal: string;
  resumoParecer: string;
}
