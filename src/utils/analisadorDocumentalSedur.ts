// src/utils/analisadorDocumentalSedur.ts
import { DocumentoAnexado, ResultadoAuditoriaSedur } from '../types/analiseDocumental';
import { CHECKLIST_SEDUR_EXIGENCIAS, ItemChecklistExigencia } from './constants';

export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_');
}

export function classificarArquivoAnexado(nomeArquivo: string, modalidade: string = 'RENOVACAO_LAS') {
  const nomeNorm = normalizarTexto(nomeArquivo);

  // Verificação de PDF Unificado (Ex: PDF24, processo completo, etc.)
  if (
    nomeNorm.includes('pdf24') || 
    nomeNorm.includes('unido') || 
    nomeNorm.includes('completo') || 
    nomeNorm.includes('juntado') ||
    nomeNorm.includes('processo_')
  ) {
    return {
      categoria: 'ARQUIVO_UNIFICADO',
      itemChecklist: null,
      status: 'PENDENTE' as const,
      observacao: 'PDF unificado identificado. Selecione manualmente os documentos contidos no arquivo.'
    };
  }

  const checklist = CHECKLIST_SEDUR_EXIGENCIAS[modalidade] || CHECKLIST_SEDUR_EXIGENCIAS['RENOVACAO_LAS'];

  for (const item of checklist) {
    for (const sinonimo of item.sinonimos) {
      if (nomeNorm.includes(normalizarTexto(sinonimo))) {
        return {
          categoria: item.nome.split(' ')[0].toUpperCase(),
          itemChecklist: item.id,
          status: 'CONFORME' as const,
          observacao: `Identificado automaticamente como: ${item.nome}`
        };
      }
    }
  }

  return {
    categoria: 'NAO_IDENTIFICADO',
    itemChecklist: null,
    status: 'PENDENTE' as const,
    observacao: 'Nomenclatura não reconhecida. Selecione o tipo correspondente na lista.'
  };
}

export function executarAuditoriaDocumentalSedur(
  anexos: DocumentoAnexado[],
  modalidade: string,
  setorDestino: string
): ResultadoAuditoriaSedur {
  const checklist = CHECKLIST_SEDUR_EXIGENCIAS[modalidade] || CHECKLIST_SEDUR_EXIGENCIAS['RENOVACAO_LAS'];
  const itensAtendidosIds = new Set(anexos.filter(a => a.itemChecklistId).map(a => a.itemChecklistId));

  const obrigatorios = checklist.filter(item => item.obrigatorio);
  const pendentesObrigatorios: string[] = [];

  obrigatorios.forEach(item => {
    if (!itensAtendidosIds.has(item.id)) {
      pendentesObrigatorios.push(item.nome);
    }
  });

  const ressalvas: string[] = [];
  
  // Regras de negócio especializadas SEDUR Camaçari
  if (modalidade === 'RENOVACAO_LAS') {
    if (!itensAtendidosIds.has('doc-cnd-municipal')) {
      ressalvas.push('Ausência de CND Municipal: Exigência vinculada ao art. 154 da LC nº 1.876/2023.');
    }
    if (!itensAtendidosIds.has('doc-procuracao')) {
      ressalvas.push('Verificar juntada do documento oficial com foto do procurador (RG/CNH).');
    }
    if (!itensAtendidosIds.has('doc-rcc')) {
      ressalvas.push('Necessário verificar cumprimento integral das condicionantes da licença anterior.');
    }
  } else if (modalidade === 'BAIXA_LICENCA') {
    ressalvas.push('A baixa definitiva da licença depende de vistoria in loco para confirmação de desativação sem passivos.');
  }

  const aptoParaDeferimento = pendentesObrigatorios.length === 0;

  return {
    totalAnexados: anexos.length,
    totalObrigatorios: obrigatorios.length,
    atendidosObrigatorios: obrigatorios.length - pendentesObrigatorios.length,
    pendentesObrigatorios,
    ressalvasIdentificadas: ressalvas,
    aptoParaDeferimento,
    fundamentacaoLegal: modalidade === 'BAIXA_LICENCA'
      ? 'Lei Complementar Municipal nº 1.876/2023 (Código Ambiental de Camaçari) e Resolução CEPRAM nº 4.579/2018.'
      : 'Art. 154 da Lei Complementar Municipal nº 1.876/2023 e Resolução CEPRAM nº 4.579/2018.',
    resumoParecer: aptoParaDeferimento
      ? `Processo instruído com todos os documentos essenciais exigidos pela SEDUR (${setorDestino}). Apto para prosseguimento do parecer.`
      : `Identificadas ${pendentesObrigatorios.length} pendências documentais obrigatórias. Sugere-se notificação do requerente no SIS-SEDUR.`
  };
}
