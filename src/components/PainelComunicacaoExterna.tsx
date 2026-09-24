// src/components/PainelComunicacaoExterna.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  X, 
  SendHorizontal,
  Building2,
  CheckSquare,
  Square,
  ArrowRightLeft,
  FileText,
  Tag,
  Pencil,
  Eye
} from 'lucide-react';
import { ComunicacaoExterna, DocumentoNotificacao } from '../types';

// ==========================================
// 1. PADRONIZAÇÃO DOS ATOS AMBIENTAIS
// ==========================================
export interface TipoAssuntoItem {
  id: string;
  sigla: string;
  nome: string;
  categoria: 'Licenciamento' | 'Atos Declaratórios' | 'Especiais';
}

export const TIPOS_ASSUNTOS_AMBIENTAIS: TipoAssuntoItem[] = [
  { id: 'LP', sigla: 'LP', nome: 'Licença Prévia (LP)', categoria: 'Licenciamento' },
  { id: 'LI', sigla: 'LI', nome: 'Licença de Instalação (LI)', categoria: 'Licenciamento' },
  { id: 'LO', sigla: 'LO', nome: 'Licença de Operação (LO)', categoria: 'Licenciamento' },
  { id: 'LAS', sigla: 'LAS', nome: 'Licença Ambiental Simplificada (LAS)', categoria: 'Licenciamento' },
  { id: 'LAU', sigla: 'LAU', nome: 'Licença Ambiental Unificada (LAU)', categoria: 'Licenciamento' },
  { id: 'RENOVACAO', sigla: 'RLA', nome: 'Renovação de Licença Ambiental', categoria: 'Especiais' },
  { id: 'DISPENSA', sigla: 'DLA', nome: 'Dispensa de Licenciamento Ambiental (DLA)', categoria: 'Atos Declaratórios' },
  { id: 'INEXIGIBILIDADE', sigla: 'INEX', nome: 'Declaração de Inexigibilidade de Licença', categoria: 'Atos Declaratórios' },
  { id: 'AUTORIZACAO', sigla: 'AA', nome: 'Autorização Ambiental (AA)', categoria: 'Atos Declaratórios' },
  { id: 'REGULARIZACAO', sigla: 'LOR', nome: 'Licença de Regularização / Operação Corretiva', categoria: 'Especiais' },
];

export function obterEstiloAssunto(siglaOrId?: string): { bg: string; text: string; border: string } {
  switch (siglaOrId) {
    case 'LP':
      return { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' };
    case 'LI':
      return { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-300' };
    case 'LO':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' };
    case 'LAS':
    case 'LAU':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' };
    case 'RENOVACAO':
      return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' };
    case 'DISPENSA':
    case 'INEXIGIBILIDADE':
      return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300' };
    case 'AUTORIZACAO':
      return { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' };
    default:
      return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' };
  }
}

const STORAGE_KEY = 'astec_comunicacoes_externas';

export function calcularDataLimite(dataInicio: string, dias: number): string {
  if (!dataInicio) return '';
  const d = new Date(dataInicio + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}

export function calcularDiasRestantes(dataLimite: string): number {
  if (!dataLimite) return 0;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = new Date(dataLimite + 'T00:00:00');
  const diff = limite.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export type CenarioDespacho = 
  | 'NOTIF_INICIAL'
  | 'PRORROG_1'
  | 'PRORROG_2'
  | 'INDEFERIMENTO_ARQUIVAMENTO'
  | 'DESPACHO_DEVOLUCAO_ARQUIVAMENTO';

export const PainelComunicacaoExterna: React.FC = () => {
  const [comunicacoes, setComunicacoes] = useState<(ComunicacaoExterna & { tipo_assunto?: string; qtd_prorrogacoes?: number })[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  
  // Modal de Cadastro/Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [novoProcesso, setNovoProcesso] = useState('');
  const [novoInteressado, setNovoInteressado] = useState('');
  const [novoTipoAssunto, setNovoTipoAssunto] = useState('LO');
  const [novaQtdProrrogacoes, setNovaQtdProrrogacoes] = useState(0);
  const [novoSetor, setNovoSetor] = useState('CLA');
  const [novaDataEnvio, setNovaDataEnvio] = useState(new Date().toISOString().split('T')[0]);
  const [novoPrazoDias, setNovoPrazoDias] = useState(30);
  const [novoTextoDocs, setNovoTextoDocs] = useState('');
  const [novasObs, setNovasObs] = useState('');

  // Modal de Visualização e Emissão de Despacho
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
  const [processoSelecionado, setProcessoSelecionado] = useState<typeof comunicacoes[0] | null>(null);
  const [cenarioSelecionado, setCenarioSelecionado] = useState<CenarioDespacho>('NOTIF_INICIAL');
  const [textoPreview, setTextoPreview] = useState('');
  const [copiadoPreview, setCopiadoPreview] = useState(false);

  // Carrega do LocalStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setComunicacoes(JSON.parse(data));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const salvarLista = (novaLista: typeof comunicacoes) => {
    setComunicacoes(novaLista);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    } catch (e) {
      console.error(e);
    }
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setNovoProcesso('');
    setNovoInteressado('');
    setNovoTipoAssunto('LO');
    setNovaQtdProrrogacoes(0);
    setNovoSetor('CLA');
    setNovaDataEnvio(new Date().toISOString().split('T')[0]);
    setNovoPrazoDias(30);
    setNovoTextoDocs('');
    setNovasObs('');
  };

  const handleAbrirCriacao = () => {
    limparFormulario();
    setModalAberto(true);
  };

  const handleAbrirEdicao = (c: typeof comunicacoes[0]) => {
    setEditandoId(c.id);
    setNovoProcesso(c.numero_processo);
    setNovoInteressado(c.interessado);
    setNovoTipoAssunto(c.tipo_assunto || 'LO');
    setNovaQtdProrrogacoes(c.qtd_prorrogacoes || 0);
    setNovoSetor(c.setor_origem);
    setNovaDataEnvio(c.data_envio);
    setNovoPrazoDias(c.prazo_dias);
    setNovoTextoDocs(c.documentos.map(d => d.nome).join('\n'));
    setNovasObs(c.observacoes || '');
    setModalAberto(true);
  };

  const obterDescricaoAssunto = (siglaOrId?: string) => {
    if (!siglaOrId) return 'Licenciamento Ambiental';
    const achado = TIPOS_ASSUNTOS_AMBIENTAIS.find(t => t.id === siglaOrId || t.sigla === siglaOrId);
    return achado ? achado.nome : siglaOrId;
  };

  // Gerador de Texto conforme o cenário selecionado
  const gerarTextoPorCenario = (c: typeof comunicacoes[0], cenario: CenarioDespacho): string => {
    const pendentes = c.documentos.filter(d => !d.entregue).map((d, i) => `  ${i + 1}. ${d.nome}`).join('\n');
    const dataLimiteFmt = c.data_limite.split('-').reverse().join('/');
    const dataHojeFmt = new Date().toLocaleDateString('pt-BR');
    const assuntoStr = obterDescricaoAssunto(c.tipo_assunto);
    const prorrogacoes = c.qtd_prorrogacoes || 0;

    switch (cenario) {
      case 'NOTIF_INICIAL':
        return `NOTIFICAÇÃO ADMINISTRATIVA - SIS-SEDUR / ASTEC
Processo nº: ${c.numero_processo}
Interessado: ${c.interessado}
Assunto: ${assuntoStr}
Setor: ${c.setor_origem}

Prezado(a) Requerente,

Para fins de instrução técnica do pleito de ${assuntoStr}, solicitamos a juntada aos autos, no prazo de ${c.prazo_dias} dias (até ${dataLimiteFmt}), dos seguintes documentos e esclarecimentos:

${pendentes || '  1. Regularização de documentos pendentes.'}

Informamos que é admitida a prorrogação de prazo por até 30 dias (e nova extensão de 30 dias, limite máximo), mediante requerimento justificado protocolado antes do vencimento. Esgotado o prazo sem atendimento, os autos serão devolvidos ao setor de origem (${c.setor_origem}) sugerindo-se o arquivamento.

Assessoria Técnica - ASTEC / SEDUR
Prefeitura Municipal de Camaçari`;

      case 'PRORROG_1':
        return `NOTIFICAÇÃO ADMINISTRATIVA - SIS-SEDUR / ASTEC
DEFERIMENTO DE 1ª PRORROGAÇÃO DE PRAZO
Processo nº: ${c.numero_processo}
Interessado: ${c.interessado}
Assunto: ${assuntoStr}

Prezado(a) Requerente,

1. Em atenção ao requerimento protocolado, DEFERE-SE a 1ª (primeira) prorrogação de prazo por mais 30 (trinta) dias para apresentação dos documentos pendentes referentes ao pleito de ${assuntoStr}.

2. O novo prazo fatal para cumprimento integral das exigências encerra-se em ${dataLimiteFmt}.

3. Fica ciente o requerente de que eventual novo pedido de prorrogação dependerá de requerimento formal e tempestivo, ficando adstrito ao limite máximo regulamentar de 2 (duas) prorrogações.

Assessoria Técnica - ASTEC / SEDUR
Prefeitura Municipal de Camaçari`;

      case 'PRORROG_2':
        return `NOTIFICAÇÃO ADMINISTRATIVA - SIS-SEDUR / ASTEC
DEFERIMENTO DE 2ª E ÚLTIMA PRORROGAÇÃO DE PRAZO (LIMITE MÁXIMO)
Processo nº: ${c.numero_processo}
Interessado: ${c.interessado}
Assunto: ${assuntoStr}

Prezado(a) Requerente,

1. Em caráter excepcional, DEFERE-SE a 2ª (segunda) e ÚLTIMA prorrogação de prazo por mais 30 (trinta) dias para o atendimento das pendências do processo em epígrafe.

2. O prazo final e improrrogável encerra-se em ${dataLimiteFmt}.

3. ADVERTE-SE que, esgotado este prazo sem o atendimento cabal das diligências, não haverá concessão de novo prazo adicional, sendo o processo encaminhado ao setor de origem (${c.setor_origem}) com manifestação formal sugerindo o ARQUIVAMENTO definitivo.

Assessoria Técnica - ASTEC / SEDUR
Prefeitura Municipal de Camaçari`;

      case 'INDEFERIMENTO_ARQUIVAMENTO':
        return `OFÍCIO / NOTIFICAÇÃO ADMINISTRATIVA - SIS-SEDUR / ASTEC
Processo nº: ${c.numero_processo}
Interessado: ${c.interessado}
Assunto: ${assuntoStr}

Assunto: Indeferimento de prorrogação de prazo e ciência de encaminhamento para arquivamento.

Prezado(a) Requerente,

1. Informamos que o pedido de dilação de prazo formulado nos autos foi INDEFERIDO, tendo em vista que já foram concedidas anteriormente ${prorrogacoes > 0 ? prorrogacoes : 2} (duas) prorrogações de 30 dias, restando esgotado o limite legal e regulamentar.

2. Constatada a preclusão temporal e o transcurso do período assinalado sem o saneamento integral das pendências técnicas, comunicamos que os autos serão devolvidos ao setor de origem (${c.setor_origem}) com parecer técnico sugerindo o ARQUIVAMENTO do processo administrativo.

Assessoria Técnica - ASTEC / SEDUR
Prefeitura Municipal de Camaçari`;

      case 'DESPACHO_DEVOLUCAO_ARQUIVAMENTO':
        return `DESPACHO / COTA NO PARECER INTERNO

Processo SIS-SEDUR nº: ${c.numero_processo}
Interessado: ${c.interessado}
Assunto: ${assuntoStr}
Origem: ASTEC / SEDUR
Destino: ${c.setor_origem}

1. RELATÓRIO
Trata-se de processo administrativo referente ao ato de ${assuntoStr}. O requerente foi notificado para juntada de documentação indispensável à continuidade da instrução técnica, tendo usufruído das prorrogações de prazo regulamentares (${prorrogacoes > 0 ? prorrogacoes : 2} prorrogações de 30 dias).

2. FUNDAMENTAÇÃO
Decorrido o prazo fatal sem que houvesse a entrega da totalidade dos documentos exigidos, opera-se a preclusão temporal. Não subsiste amparo administrativo para nova dilação de prazo após o esgotamento do limite fixado. A inércia da parte inviabiliza a conclusão meritória da análise ambiental.

3. CONCLUSÃO E ENCAMINHAMENTO
Ante o exposto:
a) INDEFERE-SE eventual pedido de dilação adicional de prazo;
b) RESTITUEM-SE os autos a esta unidade (${c.setor_origem}), sugerindo-se o ARQUIVAMENTO definitivo do processo administrativo, sem concessão da licença requerida, e a respectiva baixa no sistema SIS-SEDUR.

Camaçari - BA, ${dataHojeFmt}.

Assessoria Técnica - ASTEC / SEDUR`;
    }
  };

  const handleAbrirVisualizador = (c: typeof comunicacoes[0]) => {
    const dias = calcularDiasRestantes(c.data_limite);
    const prorrogacoes = c.qtd_prorrogacoes || 0;

    let cenarioInicial: CenarioDespacho = 'NOTIF_INICIAL';
    if (dias < 0 || prorrogacoes >= 2) {
      cenarioInicial = 'INDEFERIMENTO_ARQUIVAMENTO';
    } else if (prorrogacoes === 1) {
      cenarioInicial = 'PRORROG_1';
    }

    setProcessoSelecionado(c);
    setCenarioSelecionado(cenarioInicial);
    setTextoPreview(gerarTextoPorCenario(c, cenarioInicial));
    setCopiadoPreview(false);
    setModalVisualizarAberto(true);
  };

  const handleMudarCenario = (cenario: CenarioDespacho) => {
    if (!processoSelecionado) return;
    setCenarioSelecionado(cenario);
    setTextoPreview(gerarTextoPorCenario(processoSelecionado, cenario));
    setCopiadoPreview(false);
  };

  const handleCopiarPreview = () => {
    navigator.clipboard.writeText(textoPreview);
    setCopiadoPreview(true);
    setTimeout(() => setCopiadoPreview(false), 2500);
  };

  const handleSalvarComunicacao = () => {
    if (!novoProcesso.trim() || !novoInteressado.trim()) {
      alert('Informe o Número do Processo e o Interessado.');
      return;
    }

    const linhasDocs = novoTextoDocs
      .split('\n')
      .map(l => l.trim().replace(/^[-•*0-9.]+\s*/, ''))
      .filter(Boolean);

    const dataLimiteCalculada = calcularDataLimite(novaDataEnvio, novoPrazoDias);

    if (editandoId) {
      const itemExistente = comunicacoes.find(c => c.id === editandoId);
      const docsAntigos = itemExistente?.documentos || [];

      const docsAtualizados: DocumentoNotificacao[] = linhasDocs.length > 0
        ? linhasDocs.map((nome, idx) => {
            const achado = docsAntigos.find(d => d.nome.toLowerCase() === nome.toLowerCase());
            return {
              id: achado ? achado.id : `doc-${Date.now()}-${idx}`,
              nome,
              entregue: achado ? achado.entregue : false,
              data_entrega: achado ? achado.data_entrega : undefined,
            };
          })
        : [{ id: `doc-${Date.now()}-0`, nome: 'Complementação de instrução documental', entregue: false }];

      const listaAtualizada = comunicacoes.map(c => {
        if (c.id !== editandoId) return c;
        return {
          ...c,
          numero_processo: novoProcesso.trim(),
          interessado: novoInteressado.trim(),
          tipo_assunto: novoTipoAssunto,
          qtd_prorrogacoes: novaQtdProrrogacoes,
          setor_origem: novoSetor,
          data_envio: novaDataEnvio,
          prazo_dias: novoPrazoDias,
          data_limite: dataLimiteCalculada,
          documentos: docsAtualizados,
          observacoes: novasObs.trim(),
        };
      });

      salvarLista(listaAtualizada);
    } else {
      const docsFormatados: DocumentoNotificacao[] = linhasDocs.length > 0
        ? linhasDocs.map((nome, idx) => ({
            id: `doc-${Date.now()}-${idx}`,
            nome,
            entregue: false,
          }))
        : [{ id: `doc-${Date.now()}-0`, nome: 'Complementação de instrução documental', entregue: false }];

      const novaCom = {
        id: `com-${Date.now()}`,
        numero_processo: novoProcesso.trim(),
        interessado: novoInteressado.trim(),
        tipo_assunto: novoTipoAssunto,
        qtd_prorrogacoes: novaQtdProrrogacoes,
        setor_origem: novoSetor,
        data_envio: novaDataEnvio,
        prazo_dias: novoPrazoDias,
        data_limite: dataLimiteCalculada,
        documentos: docsFormatados,
        observacoes: novasObs.trim(),
        created_at: new Date().toISOString(),
      };

      salvarLista([novaCom, ...comunicacoes]);
    }

    setModalAberto(false);
    limparFormulario();
  };

  const handleToggleDoc = (comId: string, docId: string) => {
    const hojeStr = new Date().toISOString().split('T')[0];
    const atualizadas = comunicacoes.map(c => {
      if (c.id !== comId) return c;
      const docsAtualizados = c.documentos.map(d => {
        if (d.id !== docId) return d;
        const novoEntregue = !d.entregue;
        return {
          ...d,
          entregue: novoEntregue,
          data_entrega: novoEntregue ? hojeStr : undefined,
        };
      });
      return { ...c, documentos: docsAtualizados };
    });
    salvarLista(atualizadas);
  };

  const handleExcluir = (id: string) => {
    if (!confirm('Deseja remover este acompanhamento?')) return;
    salvarLista(comunicacoes.filter(c => c.id !== id));
  };

  // =========================================================================
  // EXPORTAÇÃO PERSONALIZADA PARA EXCEL (.XLS FORMATADO PARA IMPRESSÃO)
  // =========================================================================
  const handleExportarExcel = () => {
    if (comunicacoes.length === 0) {
      alert('Não há processos cadastrados para exportar.');
      return;
    }

    const dataHoje = new Date().toISOString().split('T')[0];

    // 1. Organização dos dados por data do prazo fatal (ordem cronológica crescente)
    const listaOrdenada = [...comunicacoes].sort((a, b) => {
      if (!a.data_limite) return 1;
      if (!b.data_limite) return -1;
      return a.data_limite.localeCompare(b.data_limite);
    });

    // 2. Formatação com letras (a), (b), (c)... em cada documento
    const formatarDocsComLetras = (docs: DocumentoNotificacao[]): string => {
      if (!docs || docs.length === 0) return 'Nenhum documento especificado';
      return docs.map((d, i) => {
        let letra = '';
        if (i < 26) {
          letra = String.fromCharCode(97 + i); // a, b, c...
        } else {
          const p = String.fromCharCode(97 + Math.floor(i / 26) - 1);
          const s = String.fromCharCode(97 + (i % 26));
          letra = `${p}${s}`;
        }
        return `(${letra}) ${d.nome}`;
      }).join('<br style="mso-data-placement:same-cell;" />');
    };

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Relatório de Prazos e Comunicação Externa</title>
        <style>
          @page { size: landscape; margin: 12mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; background-color: #ffffff; }
          h2 { margin-bottom: 4px; font-size: 15px; color: #0f172a; }
          p { margin-top: 0; margin-bottom: 12px; font-size: 11px; color: #64748b; }
          table { border-collapse: collapse; width: 100%; mso-displayed-decimal-separator: ","; mso-displayed-thousand-separator: "."; }
          th { background-color: #0f172a; color: #ffffff; padding: 9px 10px; border: 1px solid #475569; font-size: 11px; font-weight: bold; text-align: left; }
          th.centro { text-align: center; }
          td { padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 11px; vertical-align: top; }
          td.centro { text-align: center; }
          td.processo { font-family: Consolas, monospace; font-weight: bold; white-space: nowrap; }
          td.data { font-family: Consolas, monospace; text-align: center; white-space: nowrap; }
          td.prazo-fatal { font-family: Consolas, monospace; text-align: center; font-weight: bold; color: #991b1b; white-space: nowrap; }
          .linha-impar { background-color: #ffffff; }
          .linha-par { background-color: #f1f5f9; }
          @media print {
            body { margin: 0; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <h2>SEDUR Camaçari - Controle de Comunicação Externa e Prazos (ASTEC)</h2>
        <p>Relatório gerado em: ${new Date().toLocaleString('pt-BR')} | Total de processos: ${listaOrdenada.length} (Organizados por data do Prazo Fatal)</p>
        <table>
          <thead>
            <tr>
              <th class="centro" style="width: 50px;">Item</th>
              <th style="width: 170px;">Processo</th>
              <th style="width: 190px;">Tipo de Assunto Ambiental</th>
              <th style="width: 220px;">Interessado / Requerente</th>
              <th>Documentos Solicitados</th>
              <th class="centro" style="width: 115px;">Data Envio Comunicação</th>
              <th class="centro" style="width: 115px;">Prazo Fatal</th>
            </tr>
          </thead>
          <tbody>
    `;

    listaOrdenada.forEach((c, idx) => {
      const classeLinha = idx % 2 === 0 ? 'linha-impar' : 'linha-par';
      const itemNumero = `#${String(idx + 1).padStart(2, '0')}`;
      const assuntoStr = obterDescricaoAssunto(c.tipo_assunto);
      const docsComLetras = formatarDocsComLetras(c.documentos);
      const dataEnvioFmt = c.data_envio ? c.data_envio.split('-').reverse().join('/') : '-';
      const dataLimiteFmt = c.data_limite ? c.data_limite.split('-').reverse().join('/') : '-';

      html += `
        <tr class="${classeLinha}">
          <td class="centro" style="font-weight: bold;">${itemNumero}</td>
          <td class="processo">${c.numero_processo}</td>
          <td>${assuntoStr}</td>
          <td><b>${c.interessado}</b></td>
          <td style="line-height: 1.45;">${docsComLetras}</td>
          <td class="data">${dataEnvioFmt}</td>
          <td class="prazo-fatal">${dataLimiteFmt}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SEDUR_Relatorio_Prazos_${dataHoje}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPIs
  const total = comunicacoes.length;
  const cumpridos = comunicacoes.filter(c => c.documentos.length > 0 && c.documentos.every(d => d.entregue)).length;
  const expirados = comunicacoes.filter(c => {
    const todosEntregues = c.documentos.length > 0 && c.documentos.every(d => d.entregue);
    return !todosEntregues && calcularDiasRestantes(c.data_limite) < 0;
  }).length;
  const criticos = comunicacoes.filter(c => {
    const todosEntregues = c.documentos.length > 0 && c.documentos.every(d => d.entregue);
    const dias = calcularDiasRestantes(c.data_limite);
    return !todosEntregues && dias >= 0 && dias <= 7;
  }).length;

  // Filtragem
  const listaFiltrada = useMemo(() => {
    return comunicacoes.filter(c => {
      const termo = busca.toLowerCase();
      const assuntoNome = obterDescricaoAssunto(c.tipo_assunto).toLowerCase();
      const matchBusca = 
        c.numero_processo.toLowerCase().includes(termo) ||
        c.interessado.toLowerCase().includes(termo) ||
        assuntoNome.includes(termo) ||
        c.documentos.some(d => d.nome.toLowerCase().includes(termo));

      if (!matchBusca) return false;

      const todosEntregues = c.documentos.length > 0 && c.documentos.every(d => d.entregue);
      const dias = calcularDiasRestantes(c.data_limite);

      if (filtroStatus === 'VENCIDOS') return !todosEntregues && dias < 0;
      if (filtroStatus === 'CRITICOS') return !todosEntregues && dias >= 0 && dias <= 7;
      if (filtroStatus === 'CUMPRIDOS') return todosEntregues;
      if (filtroStatus === 'ANDAMENTO') return !todosEntregues && dias > 7;

      return true;
    });
  }, [comunicacoes, busca, filtroStatus]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-600" />
            Controle de Comunicação Externa e Prazos (SIS-SEDUR)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhe prazos fatais de diligências, entregas documentais pelo requerente e emita despachos de arquivamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportarExcel}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Baixar Relatório Excel (.xls)
          </button>

          <button
            type="button"
            onClick={handleAbrirCriacao}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Comunicação Externa
          </button>
        </div>
      </div>

      {/* Cards de Resumo (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setFiltroStatus('TODOS')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filtroStatus === 'TODOS' ? 'border-slate-900 bg-white ring-2 ring-slate-800 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-white'
          }`}
        >
          <div className="text-xs font-medium text-slate-500">Total Monitorados</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{total}</div>
        </div>

        <div 
          onClick={() => setFiltroStatus('CRITICOS')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filtroStatus === 'CRITICOS' ? 'border-amber-500 bg-white ring-2 ring-amber-400 shadow-sm' : 'bg-amber-50/50 border-amber-200 hover:bg-white'
          }`}
        >
          <div className="text-xs font-medium text-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Prazos Críticos (&le; 7 dias)
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{criticos}</div>
        </div>

        <div 
          onClick={() => setFiltroStatus('VENCIDOS')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filtroStatus === 'VENCIDOS' ? 'border-rose-500 bg-white ring-2 ring-rose-400 shadow-sm' : 'bg-rose-50/50 border-rose-200 hover:bg-white'
          }`}
        >
          <div className="text-xs font-medium text-rose-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Prazos Vencidos (Devolver)
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{expirados}</div>
        </div>

        <div 
          onClick={() => setFiltroStatus('CUMPRIDOS')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filtroStatus === 'CUMPRIDOS' ? 'border-emerald-500 bg-white ring-2 ring-emerald-400 shadow-sm' : 'bg-emerald-50/50 border-emerald-200 hover:bg-white'
          }`}
        >
          <div className="text-xs font-medium text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Cumpridos
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{cumpridos}</div>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número do processo, interessado, tipo de assunto ou documento..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-slate-600 shadow-sm"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'ANDAMENTO', label: 'Em Prazo' },
            { id: 'CRITICOS', label: 'Críticos' },
            { id: 'VENCIDOS', label: 'Vencidos' },
            { id: 'CUMPRIDOS', label: 'Cumpridos' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltroStatus(f.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filtroStatus === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE PROCESSOS */}
      <div className="space-y-4">
        {listaFiltrada.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Nenhum processo localizado</h3>
            <p className="text-xs text-slate-500 mt-1">
              {comunicacoes.length === 0 
                ? 'Clique em "+ Nova Comunicação Externa" para cadastrar seu primeiro acompanhamento de prazo.'
                : 'Nenhum registro corresponde aos filtros selecionados.'}
            </p>
          </div>
        ) : (
          listaFiltrada.map((c, index) => {
            const dias = calcularDiasRestantes(c.data_limite);
            const todosEntregues = c.documentos.length > 0 && c.documentos.every(d => d.entregue);
            const entreguesQtd = c.documentos.filter(d => d.entregue).length;
            const assuntoNome = obterDescricaoAssunto(c.tipo_assunto);
            const estiloAssunto = obterEstiloAssunto(c.tipo_assunto);
            const prorrogacoes = c.qtd_prorrogacoes || 0;
            const numeroSequencial = String(index + 1).padStart(2, '0');

            let estiloCard = 'border-l-[6px] border-l-slate-300 border-slate-200 bg-white hover:border-l-purple-600 hover:border-purple-300 hover:bg-purple-50/10 transition-all duration-200';

            if (todosEntregues) {
              estiloCard = 'border-l-[6px] border-l-emerald-500 border-emerald-300 bg-emerald-50/20 hover:border-l-emerald-600 hover:border-emerald-400 transition-all duration-200';
            } else if (dias < 0) {
              estiloCard = 'border-l-[6px] border-l-rose-500 border-rose-300 bg-rose-50/20 hover:border-l-rose-600 hover:border-rose-400 transition-all duration-200';
            } else if (dias <= 7) {
              estiloCard = 'border-l-[6px] border-l-amber-500 border-amber-300 bg-amber-50/20 hover:border-l-amber-600 hover:border-amber-400 transition-all duration-200';
            }

            return (
              <div 
                key={c.id}
                className={`rounded-2xl border shadow-sm hover:shadow-md overflow-hidden ${estiloCard}`}
              >
                {/* Cabeçalho do Card */}
                <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-black font-mono bg-slate-900 text-white tracking-wider shadow-sm">
                      #{numeroSequencial}
                    </span>

                    <span className="font-mono font-bold text-sm text-slate-900">
                      {c.numero_processo}
                    </span>

                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 shadow-2xs ${estiloAssunto.bg} ${estiloAssunto.text} ${estiloAssunto.border}`}>
                      <Tag className="w-3 h-3" />
                      {assuntoNome}
                    </span>

                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-white text-slate-700 border border-slate-200">
                      Origem: {c.setor_origem}
                    </span>

                    {prorrogacoes > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {prorrogacoes}ª Prorrogação (+30d)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {todosEntregues ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Cumprido ({entreguesQtd}/{c.documentos.length})
                      </span>
                    ) : dias < 0 ? (
                      <span className="px-3 py-1.5 bg-rose-100 text-rose-950 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-pulse shadow-2xs">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Vencido há {Math.abs(dias)} dias! Devolver à {c.setor_origem}
                      </span>
                    ) : dias <= 7 ? (
                      <span className="px-3 py-1.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Atenção: Vence em {dias} dias!
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Faltam {dias} dias
                      </span>
                    )}
                  </div>
                </div>

                {/* Corpo do Card */}
                <div className="p-5 space-y-4">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>Requerente / Interessado:</span>
                    <span className="text-slate-950 font-bold text-sm">{c.interessado}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">DATA ENVIO:</span>
                      <span className="font-semibold text-slate-700">{c.data_envio.split('-').reverse().join('/')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">PRAZO TOTAL:</span>
                      <span className="font-semibold text-slate-700">{c.prazo_dias} dias corridos</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">PRAZO FATAL:</span>
                      <span className="font-bold text-rose-700">{c.data_limite.split('-').reverse().join('/')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">DOCUMENTOS:</span>
                      <span className="font-semibold text-slate-700">{entreguesQtd} de {c.documentos.length} entregues</span>
                    </div>
                  </div>

                  {/* Lista de Documentos Exigidos */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Documentos Exigidos na Notificação (Clique para marcar entrega):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {c.documentos.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => handleToggleDoc(c.id, doc.id)}
                          className={`p-2 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition select-none ${
                            doc.entregue
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <button type="button" className="mt-0.5 flex-shrink-0 text-emerald-600">
                            {doc.entregue ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                          </button>
                          <div className="flex-1 leading-tight">
                            <span>{doc.nome}</span>
                            {doc.entregue && doc.data_entrega && (
                              <span className="block text-[10px] text-emerald-700 mt-0.5 font-normal">
                                Anexado em: {doc.data_entrega.split('-').reverse().join('/')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botões de Ação do Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAbrirVisualizador(c)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-purple-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-300" />
                        Visualizar Despachos / Modelos
                      </button>

                      {dias < 0 && !todosEntregues && (
                        <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          <ArrowRightLeft className="w-3.5 h-3.5" /> Devolver processo à {c.setor_origem}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAbrirEdicao(c)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Editar Acompanhamento"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExcluir(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Excluir Acompanhamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE VISUALIZAÇÃO DE DESPACHOS */}
      {modalVisualizarAberto && processoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Visualizar e Emitir Despacho / Comunicação
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Processo: <span className="font-mono font-bold text-slate-700">{processoSelecionado.numero_processo}</span> — {processoSelecionado.interessado}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalVisualizarAberto(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Selecione o Modelo de Comunicação / Despacho a emitir:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleMudarCenario('NOTIF_INICIAL')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                      cenarioSelecionado === 'NOTIF_INICIAL'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold ring-2 ring-purple-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>1. Notificação Inicial de Diligência</span>
                    <span className="text-[10px] font-normal text-slate-500 mt-1">
                      Aviso de prazo regular de {processoSelecionado.prazo_dias} dias p/ documentos.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMudarCenario('PRORROG_1')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                      cenarioSelecionado === 'PRORROG_1'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold ring-2 ring-purple-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>2. Deferir 1ª Prorrogação (+30d)</span>
                    <span className="text-[10px] font-normal text-slate-500 mt-1">
                      Concessão adicional de 30 dias a pedido da parte.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMudarCenario('PRORROG_2')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                      cenarioSelecionado === 'PRORROG_2'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold ring-2 ring-purple-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>3. Deferir 2ª Prorrogação (+30d - Limite)</span>
                    <span className="text-[10px] font-normal text-slate-500 mt-1">
                      Última extensão em caráter improrrogável.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMudarCenario('INDEFERIMENTO_ARQUIVAMENTO')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                      cenarioSelecionado === 'INDEFERIMENTO_ARQUIVAMENTO'
                        ? 'border-rose-600 bg-rose-50/70 text-rose-950 font-bold ring-2 ring-rose-500'
                        : 'border-rose-200 bg-rose-50/20 text-rose-900 hover:bg-rose-50'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      4. Indeferimento de Prazo + Aviso de Arquivamento
                    </span>
                    <span className="text-[10px] font-normal text-rose-700 mt-1">
                      Comunicação externa: esgotamento de prorrogações e envio para arquivar.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMudarCenario('DESPACHO_DEVOLUCAO_ARQUIVAMENTO')}
                    className={`sm:col-span-2 p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                      cenarioSelecionado === 'DESPACHO_DEVOLUCAO_ARQUIVAMENTO'
                        ? 'border-slate-900 bg-slate-100 text-slate-950 font-bold ring-2 ring-slate-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1 font-bold">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-slate-700" />
                      5. Cota / Parecer de Devolução ao Setor com Sugestão de Arquivamento
                    </span>
                    <span className="text-[10px] font-normal text-slate-500 mt-0.5">
                      Despacho interno encaminhando os autos para a {processoSelecionado.setor_origem} sugerindo o arquivamento definitivo.
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Texto do Despacho / Comunicação (Você pode revisar ou ajustar antes de copiar):
                  </label>
                  <button
                    type="button"
                    onClick={() => setTextoPreview(gerarTextoPorCenario(processoSelecionado, cenarioSelecionado))}
                    className="text-[11px] text-purple-600 hover:underline"
                  >
                    Restaurar Texto Original
                  </button>
                </div>
                <textarea
                  rows={11}
                  value={textoPreview}
                  onChange={e => setTextoPreview(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50/50 text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {copiadoPreview ? '✓ Texto copiado com sucesso para a área de transferência!' : 'Revise o conteúdo e copie para colar no SIS-SEDUR.'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalVisualizarAberto(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleCopiarPreview}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                >
                  {copiadoPreview ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiadoPreview ? 'Copiado!' : 'Copiar Texto Selecionado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                {editandoId ? <Pencil className="w-4 h-4 text-purple-600" /> : <SendHorizontal className="w-4 h-4 text-emerald-600" />}
                {editandoId ? 'Editar Comunicação Externa' : 'Cadastrar Comunicação Externa no SIS-SEDUR'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalAberto(false);
                  limparFormulario();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número do Processo SIS-SEDUR *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 04276.22.09.461.2025"
                    value={novoProcesso}
                    onChange={e => setNovoProcesso(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Assunto Ambiental *
                  </label>
                  <select
                    value={novoTipoAssunto}
                    onChange={e => setNovoTipoAssunto(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {TIPOS_ASSUNTOS_AMBIENTAIS.map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.sigla}] {t.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Interessado / Razão Social *
                  </label>
                  <input
                    type="text"
                    placeholder="Nome da empresa ou requerente"
                    value={novoInteressado}
                    onChange={e => setNovoInteressado(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Setor de Origem (Para devolver se expirar) *
                  </label>
                  <select
                    value={novoSetor}
                    onChange={e => setNovoSetor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="CLA">CLA - Coord. Licenciamento Ambiental</option>
                    <option value="CLU">CLU - Coord. Licenciamento Urbanístico</option>
                    <option value="GABINETE">GABINETE - Gabinete SEDUR</option>
                    <option value="DIRAM">DIRAM - Diretoria de Meio Ambiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prorrogações Concedidas
                  </label>
                  <select
                    value={novaQtdProrrogacoes}
                    onChange={e => setNovaQtdProrrogacoes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value={0}>0 - Prazo inicial regular</option>
                    <option value={1}>1 - Uma prorrogação concedida (+30d)</option>
                    <option value={2}>2 - Duas prorrogações (+60d - Limite Máximo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Envio da Comunicação *
                  </label>
                  <input
                    type="date"
                    value={novaDataEnvio}
                    onChange={e => setNovaDataEnvio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prazo Concedido ao Requerente *
                  </label>
                  <select
                    value={novoPrazoDias}
                    onChange={e => setNovoPrazoDias(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value={15}>15 dias</option>
                    <option value={20}>20 dias</option>
                    <option value={30}>30 dias (Padrão ambiental)</option>
                    <option value={60}>60 dias</option>
                    <option value={90}>90 dias</option>
                  </select>
                </div>
              </div>

              {novaQtdProrrogacoes >= 2 && (
                <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-900 text-xs">
                  <strong>Atenção:</strong> Processo no limite regulamentar (2 prorrogações). Os modelos já estarão pré-configurados com a sugestão de arquivamento.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Documentos Solicitados (1 por linha):
                </label>
                <textarea
                  rows={4}
                  placeholder="Exemplo:&#10;Certidão de matrícula atualizada&#10;Licença do Corpo de Bombeiros (AVCB)&#10;Estudo de Impacto Ambiental / Relatório Ambiental Simplificado"
                  value={novoTextoDocs}
                  onChange={e => setNovoTextoDocs(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Internas (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Requerente solicitou prorrogação verbalmente"
                  value={novasObs}
                  onChange={e => setNovasObs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalAberto(false);
                  limparFormulario();
                }}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarComunicacao}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
              >
                {editandoId ? 'Salvar Alterações' : 'Salvar Acompanhamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
