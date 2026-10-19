// src/utils/analisadorDocumentalSedur.ts
import { DocumentoAnexado, ResultadoAuditoriaSedur } from '../types/analiseDocumental';

/**
 * Padrões de reconhecimento de documentos ambientais da SEDUR Camaçari
 */
const PADROES_DOCS_SEDUR: {
  termoChave: RegExp;
  itemChecklist: string;
  categoria: string;
  obrigatorioPadrao: boolean;
  regraEspecial?: string;
}[] = [
  {
    termoChave: /requerimento|formulario.*requerente|solicitacao/i,
    itemChecklist: 'Requerimento Padrão do SIS-SEDUR',
    categoria: 'Formalização',
    obrigatorioPadrao: true,
  },
  {
    termoChave: /cnpj|cartao.*cnpj|comprovante.*inscricao/i,
    itemChecklist: 'Cartão CNPJ Atualizado',
    categoria: 'Identificação',
    obrigatorioPadrao: true,
  },
  {
    termoChave: /contrato.*social|estatuto|requerimento.*empresario|alteracao.*contratual/i,
    itemChecklist: 'Ato Constitutivo (Contrato Social / Estatuto)',
    categoria: 'Identificação',
    obrigatorioPadrao: true,
  },
  {
    termoChave: /procuracao|mandato|substabelecimento/i,
    itemChecklist: 'Procuração com poderes específicos e documentos do procurador',
    categoria: 'Representação',
    obrigatorioPadrao: false,
  },
  {
    termoChave: /matricula|rgi|certidao.*onus|escritura|registro.*imoveis/i,
    itemChecklist: 'Certidão de Matrícula e Ônus Reais do RGI',
    categoria: 'Dominialidade',
    obrigatorioPadrao: true,
    regraEspecial: 'Pode ser substituída por Contrato de Locação com firmas reconhecidas.',
  },
  {
    termoChave: /contrato.*locacao|aluguel|arrendamento|cessao.*uso/i,
    itemChecklist: 'Contrato de Locação / Posse Legítima',
    categoria: 'Dominialidade',
    obrigatorioPadrao: false,
    regraEspecial: 'Exige reconhecimento de firma das partes e prova dominial do locador.',
  },
  {
    termoChave: /viabilidade|uso.*solo|consulta.*previa|certidao.*zoneamento/i,
    itemChecklist: 'Certidão de Viabilidade de Localização e Uso do Solo (SEDUR)',
    categoria: 'Urbanístico',
    obrigatorioPadrao: true,
  },
  {
    termoChave: /memorial.*descritivo|relatorio.*atividades|caracterizacao/i,
    itemChecklist: 'Memorial Descritivo da Atividade e Processos Produtivos',
    categoria: 'Técnico Ambiental',
    obrigatorioPadrao: true,
  },
  {
    termoChave: /planta|layout|projeto.*arquitetonico|croqui/i,
    itemChecklist: 'Planta de Localização e Layout do Empreendimento',
    categoria: 'Projetos',
    obrigatorioPadrao: true,
  },
  {
    termoChave: /pgrs|residuos.*solidos|plano.*gerenciamento/i,
    itemChecklist: 'Plano de Gerenciamento de Resíduos Sólidos (PGRS) com ART/RRT',
    categoria: 'Técnico Ambiental',
    obrigatorioPadrao: false,
  },
  {
    termoChave: /embasa|esgoto|concessionaria.*agua|fossa|sumidouro/i,
    itemChecklist: 'Declaração da Concessionária (EMBASA) ou ART de Fossa Séptica',
    categoria: 'Infraestrutura',
    obrigatorioPadrao: true,
    regraEspecial: 'Na ausência de rede de esgoto da EMBASA, apresentar ART de fossa e sumidouro.',
  },
  {
    termoChave: /coelba|energia|neoenergia|conta.*luz/i,
    itemChecklist: 'Comprovante de Energia Elétrica (Neoenergia Coelba)',
    categoria: 'Infraestrutura',
    obrigatorioPadrao: false,
  },
  {
    termoChave: /bombeiros|avcb|clcb|panico/i,
    itemChecklist: 'Certificado do Corpo de Bombeiros (AVCB)',
    categoria: 'Segurança',
    obrigatorioPadrao: false,
    regraEspecial: 'ATENÇÃO: Conforme diretriz da CLA/SEDUR, o AVCB NÃO é obrigatório para Licenciamento Ambiental Ordinário.',
  },
];

/**
 * Classifica um arquivo anexado pelo nome e metadados
 */
export function classificarArquivoAnexado(arquivoNome: string): {
  itemChecklist: string;
  categoria: string;
  observacao: string;
  status: 'CONFORME' | 'RESSALVA';
} {
  const achado = PADROES_DOCS_SEDUR.find(p => p.termoChave.test(arquivoNome));

  if (achado) {
    if (achado.termoChave.test('bombeiros') || achado.termoChave.test('avcb')) {
      return {
        itemChecklist: achado.itemChecklist,
        categoria: achado.categoria,
        observacao: 'Documento informativo anexado. Ressalta-se que o AVCB não é condicionante obrigatória na CLA/SEDUR.',
        status: 'CONFORME',
      };
    }

    return {
      itemChecklist: achado.itemChecklist,
      categoria: achado.categoria,
      observacao: achado.regraEspecial || 'Documento preliminarmente identificado como compatível.',
      status: 'CONFORME',
    };
  }

  return {
    itemChecklist: 'Documento Complementar Não Categorizado',
    categoria: 'Geral',
    observacao: 'Verificar manualmente o conteúdo para vinculação à exigência legal.',
    status: 'RESSALVA',
  };
}

/**
 * Realiza a auditoria completa do processo com base na legislação de Camaçari
 */
export function executarAuditoriaDocumentalSedur(
  anexos: DocumentoAnexado[],
  modalidade: string = 'LAS',
  setor: string = 'CLA'
): ResultadoAuditoriaSedur {
  const itensObrigatoriosBase = [
    'Requerimento Padrão do SIS-SEDUR',
    'Cartão CNPJ Atualizado',
    'Ato Constitutivo (Contrato Social / Estatuto)',
    'Certidão de Matrícula e Ônus Reais do RGI',
    'Certidão de Viabilidade de Localização e Uso do Solo (SEDUR)',
    'Memorial Descritivo da Atividade e Processos Produtivos',
    'Planta de Localização e Layout do Empreendimento',
    'Declaração da Concessionária (EMBASA) ou ART de Fossa Séptica',
  ];

  const docsIdentificadosNomes = anexos.map(a => a.itemChecklistId || a.categoriaIdentificada || '');

  // Validação dominial flexível (RGI ou Contrato de Locação)
  const temRgi = docsIdentificadosNomes.some(n => /matr[íi]cula|rgi|ônus/i.test(n));
  const temLocacao = docsIdentificadosNomes.some(n => /loca[çc][ãa]o|posse/i.test(n));
  const dominialidadeAtendida = temRgi || temLocacao;

  // Checa pendências da lista obrigatória
  const pendencias: string[] = [];
  itensObrigatoriosBase.forEach(obrig => {
    if (obrig.includes('Matrícula') && dominialidadeAtendida) {
      return; // Atendido por RGI ou Locação
    }
    const presente = docsIdentificadosNomes.some(d => d.toLowerCase() === obrig.toLowerCase());
    if (!presente) {
      pendencias.push(obrig);
    }
  });

  const ressalvas: string[] = [];
  if (temLocacao && !temRgi) {
    ressalvas.push('Comprovação dominial via Contrato de Locação: Certificar firmas reconhecidas e legitimidade do locador.');
  }

  const apto = pendencias.length === 0;
  const encaminhamento = apto ? 'DEFERIMENTO' : 'DILIGENCIA_EXTERNA';

  const fundamentacao = modalidade.includes('DISPENSA') || modalidade.includes('DLA')
    ? 'Art. 53, § 2º e Anexo IV da Lei Complementar nº 1.876/2023 c/c Resolução CEPRAM nº 4.579/2018.'
    : 'Art. 51 e Anexo II da Lei Complementar nº 1.876/2023 (Código Ambiental de Camaçari) e LC nº 1.873/2023 (PDDU).';

  const resumo = apto
    ? `Constata-se a juntada integral da documentação obrigatória nos autos. O empreendimento atende aos requisitos formais, dominiais e ambientais da legislação municipal de Camaçari, opinando-se pelo DEFERIMENTO do ato com restituição dos autos à ${setor}.`
    : `Verificou-se a ausência de ${pendencias.length} documento(s) obrigatório(s) para a regular instrução técnica. Opina-se pela NOTIFICAÇÃO DO INTERESSADO (Diligência via SIS-SEDUR) assinalando prazo regulamentar para saneamento.`;

  return {
    totalAnexados: anexos.length,
    totalObrigatorios: itensObrigatoriosBase.length,
    atendidosObrigatorios: itensObrigatoriosBase.length - pendencias.length,
    pendentesObrigatorios: pendencias,
    ressalvasIdentificadas: ressalvas,
    aptoParaDeferimento: apto,
    encaminhamentoSugerido: encaminhamento,
    fundamentacaoLegal: fundamentacao,
    resumoParecer: resumo,
  };
}
