// src/utils/constants.ts

export interface ItemChecklistExigencia {
  id: string;
  nome: string;
  obrigatorio: boolean;
  sinonimos: string[]; // Termos para classificação automática do nome
}

// Checklists Oficiais SEDUR Camaçari por Modalidade
export const CHECKLIST_SEDUR_EXIGENCIAS: Record<string, ItemChecklistExigencia[]> = {
  RENOVACAO_LAS: [
    {
      id: 'doc-requerimento',
      nome: 'Requerimento de Licenciamento Ambiental / Formulário SEDUR',
      obrigatorio: true,
      sinonimos: ['requerimento', 'formulario', 'solicitacao', 'peticao']
    },
    {
      id: 'doc-cnpj',
      nome: 'Comprovante de CNPJ Ativo com CNAE compatível',
      obrigatorio: true,
      sinonimos: ['cnpj', 'cartao_cnpj', 'comprovante_inscricao', 'receita']
    },
    {
      id: 'doc-contrato-social',
      nome: 'Contrato Social Consolidado registrado na JUCEB',
      obrigatorio: true,
      sinonimos: ['contrato', 'contrato_social', 'alteracao_contratual', 'juceb', 'estatuto']
    },
    {
      id: 'doc-procuracao',
      nome: 'Procuração Pública e Documento com foto do Procurador (RG/CNH)',
      obrigatorio: true,
      sinonimos: ['procuracao', 'procurador', 'cnh_procurador', 'rg_procurador', 'mandato']
    },
    {
      id: 'doc-cnd-municipal',
      nome: 'Certidão Negativa de Débitos Municipais (CND Camaçari)',
      obrigatorio: true,
      sinonimos: ['cnd', 'certidao_negativa', 'debitos', 'tributaria', 'sefaz']
    },
    {
      id: 'doc-taxa-dae',
      nome: 'Comprovante de Quitação da Taxa Ambiental (DAE SEDUR)',
      obrigatorio: true,
      sinonimos: ['dae', 'taxa', 'comprovante_pagamento', 'arrecadacao', 'banco']
    },
    {
      id: 'doc-licenca-anterior',
      nome: 'Cópia da Licença Ambiental Anterior (Portaria SEDUR)',
      obrigatorio: true,
      sinonimos: ['portaria', 'licenca_anterior', 'las_anterior', 'publicacao_dom']
    },
    {
      id: 'doc-dominialidade',
      nome: 'Comprovação Dominial (Matrícula do Imóvel / CCIR / Contrato de Locação)',
      obrigatorio: true,
      sinonimos: ['matricula', 'escritura', 'ccir', 'incra', 'registro_imoveis', 'locacao']
    },
    {
      id: 'doc-rcc',
      nome: 'Relatório de Cumprimento de Condicionantes (RCC da licença anterior)',
      obrigatorio: true,
      sinonimos: ['rcc', 'condicionantes', 'cumprimento_condicionantes', 'relatorio_ambiental']
    },
    {
      id: 'doc-estudos-ambientais',
      nome: 'Estudos Ambientais Atualizados (RCE / PRAD / PGRS) com ART quitada',
      obrigatorio: true,
      sinonimos: ['rce', 'prad', 'pgrs', 'art', 'crea', 'roteiro', 'residuos']
    },
    {
      id: 'doc-titulo-minerario',
      nome: 'Título Minerário Válido (Guia de Utilização / Alvará ANM)',
      obrigatorio: false, // Obrigatório apenas para tipologia MINERACAO
      sinonimos: ['guia_utilizacao', 'anm', 'dnpm', 'alvara_pesquisa', 'registro_licenca']
    }
  ],

  BAIXA_LICENCA: [
    {
      id: 'doc-baixa-requerimento',
      nome: 'Requerimento Formal de Baixa / Desativação de Licença Ambiental',
      obrigatorio: true,
      sinonimos: ['baixa', 'encerramento', 'desativacao', 'requerimento_baixa']
    },
    {
      id: 'doc-baixa-termo',
      nome: 'Termo de Encerramento de Atividades e Desmobilização Operacional',
      obrigatorio: true,
      sinonimos: ['termo_encerramento', 'desmobilizacao', 'paralisacao', 'fim_atividade']
    },
    {
      id: 'doc-baixa-prad-final',
      nome: 'Relatório Final de Desativação e Execução de PRAD (com ART)',
      obrigatorio: true,
      sinonimos: ['prad_final', 'recuperacao_area', 'relatorio_desativacao', 'passivo']
    },
    {
      id: 'doc-baixa-tca-quitacao',
      nome: 'Comprovante de Quitação Integral de TCAs e Compensações Ambientais',
      obrigatorio: true,
      sinonimos: ['tca', 'quitacao_tca', 'termo_compromisso', 'compensacao']
    },
    {
      id: 'doc-baixa-cnd',
      nome: 'Certidão Negativa de Débitos Municipais Atualizada (CND Camaçari)',
      obrigatorio: true,
      sinonimos: ['cnd', 'certidao_negativa', 'debitos_municipais', 'sefaz']
    },
    {
      id: 'doc-baixa-licenca-original',
      nome: 'Cópia da Licença Ambiental Original a ser baixada',
      obrigatorio: true,
      sinonimos: ['licenca_original', 'portaria_licenca', 'las_original', 'portaria']
    }
  ]
};
