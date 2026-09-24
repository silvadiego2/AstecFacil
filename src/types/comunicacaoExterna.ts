export type TipoAssuntoAmbientalId =
  | 'LP'
  | 'LI'
  | 'LO'
  | 'LAS'
  | 'LAU'
  | 'RENOVACAO'
  | 'DISPENSA'
  | 'INEXIGIBILIDADE'
  | 'AUTORIZACAO'
  | 'REGULARIZACAO';

export interface ItemAssuntoAmbiental {
  id: TipoAssuntoAmbientalId;
  sigla: string;
  nome: string;
  categoria: 'Licenciamento Ordinário' | 'Licenciamento Simplificado' | 'Atos Declaratórios e Autorizativos' | 'Procedimentos Especiais';
}

export const TIPOS_ASSUNTOS_AMBIENTAIS: ItemAssuntoAmbiental[] = [
  { id: 'LP', sigla: 'LP', nome: 'Licença Prévia (LP)', categoria: 'Licenciamento Ordinário' },
  { id: 'LI', sigla: 'LI', nome: 'Licença de Instalação (LI)', categoria: 'Licenciamento Ordinário' },
  { id: 'LO', sigla: 'LO', nome: 'Licença de Operação (LO)', categoria: 'Licenciamento Ordinário' },
  { id: 'LAS', sigla: 'LAS', nome: 'Licença Ambiental Simplificada (LAS)', categoria: 'Licenciamento Simplificado' },
  { id: 'LAU', sigla: 'LAU', nome: 'Licença Ambiental Unificada (LAU)', categoria: 'Licenciamento Ordinário' },
  { id: 'RENOVACAO', sigla: 'RLA', nome: 'Renovação de Licença Ambiental', categoria: 'Procedimentos Especiais' },
  { id: 'DISPENSA', sigla: 'DLA', nome: 'Dispensa de Licenciamento Ambiental (DLA)', categoria: 'Atos Declaratórios e Autorizativos' },
  { id: 'INEXIGIBILIDADE', sigla: 'INEX', nome: 'Declaração de Inexigibilidade de Licenciamento', categoria: 'Atos Declaratórios e Autorizativos' },
  { id: 'AUTORIZACAO', sigla: 'AA', nome: 'Autorização Ambiental (AA)', categoria: 'Atos Declaratórios e Autorizativos' },
  { id: 'REGULARIZACAO', sigla: 'LOR', nome: 'Licença de Regularização / Operação Corretiva', categoria: 'Procedimentos Especiais' },
];

export interface ComunicacaoExternaFormData {
  numeroProcesso: string;
  requerente: string;
  cpfCnpj: string;
  tipoAssunto: TipoAssuntoAmbientalId | '';
  numeroNotificacao: string;
  dataRequerimento: string;
  qtdProrrogacoes: number; // 0 = inicial, 1 = 1ª prorrogação (+30d), 2 = 2ª prorrogação (+30d - limite)
  setorOrigem: string;
  setorDestino: string;
  responsavelNome: string;
  responsavelCargo: string;
  municipioUf: string;
  textoComunicacaoExterna: string;
  textoDespachoParecer: string;
}
