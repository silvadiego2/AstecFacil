// src/utils/analisadorDocumentalSedur.ts
import { DocumentoAnexado, ResultadoAuditoriaSedur } from '../types/analiseDocumental';
import { CHECKLIST_SEDUR_EXIGENCIAS } from './constants';

export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_');
}

export function classificarArquivoAnexado(nomeArquivo: string, modalidade: string = 'RENOVACAO_LAS') {
  const nomeNorm = normalizarTexto(nomeArquivo);

  // Verificação de PDF Unificado (PDF24 / compilado)
  if (
    nomeNorm.includes('pdf24') || 
    nomeNorm.includes('unido') || 
    nomeNorm.includes('completo') || 
    nomeNorm.includes('juntado') ||
    nomeNorm.includes('processo')
  ) {
    return {
      categoria: 'ARQUIVO_UNIFICADO',
      itemChecklist: undefined, // <--- Corrigido de null para undefined
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
    itemChecklist: undefined, // <--- Corrigido de null para undefined
    status: 'PENDENTE' as const,
    observacao: 'Nomenclatura não reconhecida. Selecione o tipo correspondente na lista.'
  };
}

export function executarAuditoriaDocumentalSedur(
  anexos: DocumentoAnexado[],
  modalidade: string,
  setorDestino: string
): ResultadoAuditoriaSedur {
  const isBaixa = modalidade === 'BAIXA_LICENCA' || modalidade === 'BAIXA';
  const checklistKey = isBaixa ? 'BAIXA_LICENCA' : (CHECKLIST_SEDUR_EXIGENCIAS[modalidade] ? modalidade : 'RENOVACAO_LAS');
  const checklist = CHECKLIST_SEDUR_EXIGENCIAS[checklistKey] || CHECKLIST_SEDUR_EXIGENCIAS['RENOVACAO_LAS'];

  const itensAtendidosIds = new Set(
    anexos.filter(a => a.itemChecklistId).map(a => a.itemChecklistId as string)
  );
  const obrigatorios = checklist.filter(item => item.obrigatorio);
  const pendentesObrigatorios: string[] = [];

  obrigatorios.forEach(item => {
    if (!itensAtendidosIds.has(item.id)) {
      pendentesObrigatorios.push(item.nome);
    }
  });

  const ressalvas: string[] = [];

  if (isBaixa) {
    ressalvas.push('Condicionante de Eficácia: A expedição da Certidão/Portaria de Baixa e Cancelamento de Licença fica estritamente condicionada à realização de Vistoria Técnica In Loco pela fiscalização ambiental da SEDUR para comprovação da completa desmobilização das atividades e ausência de contaminação de solo ou corpos hídricos.');
    ressalvas.push('Passivos e PRAD: Verificar a quitação integral de multas, notificações pretéritas e comprovação do cumprimento das obrigações do PRAD final.');
  } else if (modalidade === 'RENOVACAO_LAS') {
    if (!itensAtendidosIds.has('doc-cnd-municipal')) {
      ressalvas.push('Ausência de CND Municipal: Exigência vinculada ao art. 154 da Lei Complementar Municipal nº 1.876/2023.');
    }
    if (!itensAtendidosIds.has('doc-procuracao')) {
      ressalvas.push('Juntada de documento de identificação civil com foto (RG/CNH) do procurador outorgado.');
    }
    if (!itensAtendidosIds.has('doc-rcc')) {
      ressalvas.push('Comprovação do atendimento às condicionantes da licença anterior (Relatório de Cumprimento de Condicionantes - RCC).');
    }
  }

  const aptoParaDeferimento = pendentesObrigatorios.length === 0;

  const fundamentacaoLegal = isBaixa
    ? 'ENQUADRAMENTO LEGAL: BAIXA E CANCELAMENTO DE LICENÇA AMBIENTAL por desativação/encerramento de atividade, com fulcro na Lei Complementar Municipal nº 1.876/2023 (Código Ambiental de Camaçari), arts. 138 a 140 do Decreto Estadual nº 14.024/2012 e Resolução CEPRAM nº 4.579/2018.'
    : 'ENQUADRAMENTO LEGAL: RENOVAÇÃO DE LICENÇA AMBIENTAL SIMPLIFICADA (RLA), com fulcro no art. 154 da Lei Complementar Municipal nº 1.876/2023 (Código Ambiental de Camaçari) e Resolução CEPRAM nº 4.579/2018.';

  const resumoParecer = isBaixa
    ? (aptoParaDeferimento
        ? `PARECER TÉCNICO CONCLUSIVO (${setorDestino}): Instrução documental de BAIXA DE LICENÇA regular. Empreendedor apresentou Requerimento de Desativação, Termo de Encerramento e comprovações de desmobilização. OPINA-SE pelo DEFERIMENTO DA BAIXA E CANCELAMENTO do ato autorizativo, mediante homologação da vistoria técnica final de desativação.`
        : `PARECER TÉCNICO (${setorDestino}): Requerimento de BAIXA DE LICENÇA AMBIENTAL com pendência de documentos essenciais para comprovação de encerramento e ausência de passivos ambientais. Sugere-se notificação do interessado no SIS-SEDUR.`)
    : (aptoParaDeferimento
        ? `Processo instruído com todos os documentos essenciais exigidos pela SEDUR (${setorDestino}). Apto para deferimento da renovação.`
        : `Identificadas ${pendentesObrigatorios.length} pendências documentais obrigatórias. Sugere-se notificação do requerente no SIS-SEDUR.`);

  return {
    totalAnexados: anexos.length,
    totalObrigatorios: obrigatorios.length,
    atendidosObrigatorios: obrigatorios.length - pendentesObrigatorios.length,
    pendentesObrigatorios,
    ressalvasIdentificadas: ressalvas,
    aptoParaDeferimento,
    encaminhamentoSugerido: aptoParaDeferimento ? 'DEFERIMENTO' : 'DILIGENCIA', // <--- PROPRIEDADE OBRIGATÓRIA ADICIONADA
    fundamentacaoLegal,
    resumoParecer
  };
}
