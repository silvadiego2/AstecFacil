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
  Pencil
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

export const PainelComunicacaoExterna: React.FC = () => {
  const [comunicacoes, setComunicacoes] = useState<(ComunicacaoExterna & { tipo_assunto?: string; qtd_prorrogacoes?: number })[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  
  // Modal de Cadastro/Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null); // ID do processo sendo editado (null se for novo)

  const [novoProcesso, setNovoProcesso] = useState('');
  const [novoInteressado, setNovoInteressado] = useState('');
  const [novoTipoAssunto, setNovoTipoAssunto] = useState('LO');
  const [novaQtdProrrogacoes, setNovaQtdProrrogacoes] = useState(0);
  const [novoSetor, setNovoSetor] = useState('CLA');
  const [novaDataEnvio, setNovaDataEnvio] = useState(new Date().toISOString().split('T')[0]);
  const [novoPrazoDias, setNovoPrazoDias] = useState(30);
  const [novoTextoDocs, setNovoTextoDocs] = useState('');
  const [novasObs, setNovasObs] = useState('');

  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [copiadoDespachoId, setCopiadoDespachoId] = useState<string | null>(null);

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

  // Criação ou Edição de Notificação
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
      // MODO EDIÇÃO: Atualiza o registro existente preservando o status de entrega dos documentos já conferidos
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
      // MODO CRIAÇÃO: Adiciona um novo acompanhamento
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

  // Alternar entrega de documento individual
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

  const obterDescricaoAssunto = (siglaOrId?: string) => {
    if (!siglaOrId) return 'Licenciamento Ambiental';
    const achado = TIPOS_ASSUNTOS_AMBIENTAIS.find(t => t.id === siglaOrId || t.sigla === siglaOrId);
    return achado ? achado.nome : siglaOrId;
  };

  // Copia mensagem de notificação externa
  const handleCopiarMensagemSisSedur = (c: typeof comunicacoes[0]) => {
    const pendentes = c.documentos.filter(d => !d.entregue).map((d, i) => `  ${i + 1}. ${d.nome}`).join('\n');
    const dataLimiteFmt = c.data_limite.split('-').reverse().join('/');
    const assuntoStr = obterDescricaoAssunto(c.tipo_assunto);
    const dias = calcularDiasRestantes(c.data_limite);
    const prorrogacoes = c.qtd_prorrogacoes || 0;

    let msg = '';
    if (dias < 0 && prorrogacoes >= 2) {
      msg = `NOTIFICAÇÃO ADMINISTRATIVA - SIS-SEDUR / ASTEC
Processo nº: ${c.numero_processo}
Interessado: ${c.interessado}
Assunto: ${assuntoStr}

Prezado(a) Requerente,

Informamos que o pedido de prorrogação de prazo para cumprimento de pendências técnicas foi INDEFERIDO, tendo em vista que já foram concedidas anteriormente 2 (duas) prorrogações de 30 dias no curso do processo, restando esgotado o limite regulamentar.

Diante da preclusão temporal e da ausência de juntada dos documentos solicitados, comunicamos que os autos serão devolvidos ao setor de origem (${c.setor_origem}) com sugestão de ARQUIVAMENTO.

Assessoria Técnica - ASTEC / SEDUR
Prefeitura Municipal de Camaçari`;
    } else {
      msg = `NOTIFICAÇÃO ADMINISTRATIVA - SIS-SEDUR / ASTEC
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
    }

    navigator.clipboard.writeText(msg);
    setCopiadoId(c.id);
    setTimeout(() => setCopiadoId(null), 3000);
  };

  // Copia parecer/despacho interno sugerindo arquivamento
  const handleCopiarDespachoDevolucao = (c: typeof comunicacoes[0]) => {
    const assuntoStr = obterDescricaoAssunto(c.tipo_assunto);
    const dataHojeFmt = new Date().toLocaleDateString('pt-BR');
    const prorrogacoes = c.qtd_prorrogacoes || 0;
    const textoProrrogacao = prorrogacoes === 1 
      ? '1 (uma) prorrogação de 30 dias' 
      : `${prorrogacoes > 0 ? prorrogacoes : 2} (duas) prorrogações sucessivas de 30 dias`;

    const despacho = `DESPACHO / COTA NO PARECER INTERNO

Processo SIS-SEDUR nº: ${c.numero_processo}
Interessado: ${c.interessado}
Assunto: ${assuntoStr}
Origem: ASTEC / SEDUR
Destino: ${c.setor_origem}

1. Trata-se de processo administrativo referente a ${assuntoStr}. O requerente foi notificado para juntada de documentação indispensável à continuidade da instrução, tendo sido deferidas ${textoProrrogacao}.
2. Transcorrido o prazo regulamentar sem o saneamento das pendências, resta inviabilizada a conclusão da análise técnica por inércia da parte.
3. Não havendo mais suporte procedimental para concessão de novo prazo adicional, INDEFERE-SE eventual dilação e RESTITUEM-SE os autos ao setor de origem (${c.setor_origem}) com manifestação sugerindo o ARQUIVAMENTO do processo administrativo.

Camaçari - BA, ${dataHojeFmt}.

Assessoria Técnica - ASTEC / SEDUR`;

    navigator.clipboard.writeText(despacho);
    setCopiadoDespachoId(c.id);
    setTimeout(() => setCopiadoDespachoId(null), 3000);
  };

  // EXPORTAÇÃO PARA EXCEL (.XLS)
  const handleExportarExcel = () => {
    if (comunicacoes.length === 0) {
      alert('Não há processos cadastrados para exportar.');
      return;
    }

    const dataHoje = new Date().toISOString().split('T')[0];

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11px; }
          th { background-color: #0f172a; color: #ffffff; padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
          td { padding: 6px; border: 1px solid #cbd5e1; vertical-align: top; }
          .vencido { background-color: #fee2e2; color: #991b1b; font-weight: bold; }
          .critico { background-color: #fef3c7; color: #92400e; font-weight: bold; }
          .cumprido { background-color: #d1fae5; color: #065f46; font-weight: bold; }
          .em-prazo { background-color: #f0fdf4; color: #166534; }
        </style>
      </head>
      <body>
        <h2>SEDUR Camaçari - Controle de Comunicação Externa e Prazos (ASTEC)</h2>
        <p>Relatório gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        <table>
          <thead>
            <tr>
              <th>Processo SIS-SEDUR</th>
              <th>Tipo de Assunto Ambiental</th>
              <th>Interessado / Requerente</th>
              <th>Setor de Devolução</th>
              <th>Prorrogações</th>
              <th>Data Envio</th>
              <th>Prazo (Dias)</th>
              <th>Prazo Fatal</th>
              <th>Situação do Prazo</th>
              <th>Documentos Solicitados</th>
              <th>Documentos Entregues</th>
              <th>Documentos Pendentes</th>
              <th>Ação Recomendada</th>
            </tr>
          </thead>
          <tbody>
    `;

    comunicacoes.forEach(c => {
      const dias = calcularDiasRestantes(c.data_limite);
      const todosEntregues = c.documentos.length > 0 && c.documentos.every(d => d.entregue);
      
      let classeCss = 'em-prazo';
      let situacaoTexto = `Em prazo (${dias} dias restantes)`;
      let acaoRecomendada = 'Aguardar prazo do requerente';

      if (todosEntregues) {
        classeCss = 'cumprido';
        situacaoTexto = 'Cumprido integralmente';
        acaoRecomendada = `Prosseguir análise técnica (${c.setor_origem})`;
      } else if (dias < 0) {
        classeCss = 'vencido';
        situacaoTexto = `PRAZO VENCIDO (expirado há ${Math.abs(dias)} dias)`;
        acaoRecomendada = `DEVOLVER AO SETOR (${c.setor_origem}) P/ ARQUIVAMENTO`;
      } else if (dias <= 7) {
        classeCss = 'critico';
        situacaoTexto = `PRAZO CRÍTICO (faltam ${dias} dias)`;
        acaoRecomendada = 'Monitorar encerramento de prazo';
      }

      const docsSolicitados = c.documentos.map(d => d.nome).join('; ');
      const docsEntregues = c.documentos.filter(d => d.entregue).map(d => `${d.nome} (em ${d.data_entrega || 'data n/i'})`).join('; ') || 'Nenhum';
      const docsPendentes = c.documentos.filter(d => !d.entregue).map(d => d.nome).join('; ') || 'Nenhum (Tudo entregue)';

      html += `
        <tr>
          <td><b>${c.numero_processo}</b></td>
          <td>${obterDescricaoAssunto(c.tipo_assunto)}</td>
          <td>${c.interessado}</td>
          <td>${c.setor_origem}</td>
          <td>${c.qtd_prorrogacoes || 0} prorrogação(ões)</td>
          <td>${c.data_envio.split('-').reverse().join('/')}</td>
          <td>${c.prazo_dias} dias</td>
          <td><b>${c.data_limite.split('-').reverse().join('/')}</b></td>
          <td class="${classeCss}">${situacaoTexto}</td>
          <td>${docsSolicitados}</td>
          <td>${docsEntregues}</td>
          <td>${docsPendentes}</td>
          <td><b>${acaoRecomendada}</b></td>
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
    link.download = `SEDUR_Controle_Comunicacao_Externa_${dataHoje}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Resumo (KPIs)
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

  // Filtragem da lista
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
            Acompanhe prazos fatais de diligências, entregas documentais pelo requerente e alertas de devolução ao setor de origem.
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
            filtroStatus === 'TODOS' ? 'border-slate-900 bg-white ring-2 ring-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-white'
          }`}
        >
          <div className="text-xs font-medium text-slate-500">Total Monitorados</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{total}</div>
        </div>

        <div 
          onClick={() => setFiltroStatus('CRITICOS')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filtroStatus === 'CRITICOS' ? 'border-amber-500 bg-white ring-2 ring-amber-400' : 'bg-amber-50/50 border-amber-200 hover:bg-white'
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
            filtroStatus === 'VENCIDOS' ? 'border-rose-500 bg-white ring-2 ring-rose-400' : 'bg-rose-50/50 border-rose-200 hover:bg-white'
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
            filtroStatus === 'CUMPRIDOS' ? 'border-emerald-500 bg-white ring-2 ring-emerald-400' : 'bg-emerald-50/50 border-emerald-200 hover:bg-white'
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
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-slate-600"
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

      {/* Lista de Processos em Diligência */}
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
          listaFiltrada.map(c => {
            const dias = calcularDiasRestantes(c.data_limite);
            const todosEntregues = c.documentos.length > 0 && c.documentos.every(d => d.entregue);
            const entreguesQtd = c.documentos.filter(d => d.entregue).length;
            const assuntoNome = obterDescricaoAssunto(c.tipo_assunto);
            const prorrogacoes = c.qtd_prorrogacoes || 0;

            return (
              <div 
                key={c.id}
                className={`p-5 bg-white rounded-2xl border transition shadow-sm space-y-4 ${
                  todosEntregues
                    ? 'border-emerald-300'
                    : dias < 0
                    ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20'
                    : dias <= 7
                    ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Linha Superior: Processo, Assunto, Setor e Alertas */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {c.numero_processo}
                      </span>
                      {/* Badge do Tipo de Assunto Ambiental */}
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {assuntoNome}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Origem: {c.setor_origem}
                      </span>
                      {prorrogacoes > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {prorrogacoes}ª Prorrogação (+30d)
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {c.interessado}
                    </div>
                  </div>

                  {/* Badge de Status / Prazo Fatal */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {todosEntregues ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Cumprido ({entreguesQtd}/{c.documentos.length})
                      </span>
                    ) : dias < 0 ? (
                      <span className="px-3 py-1.5 bg-rose-100 text-rose-950 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Vencido há {Math.abs(dias)} dias! Devolver à {c.setor_origem}
                      </span>
                    ) : dias <= 7 ? (
                      <span className="px-3 py-1.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Atenção: Vence em {dias} dias!
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Faltam {dias} dias
                      </span>
                    )}
                  </div>
                </div>

                {/* Linha Intermediária: Datas e Prazos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
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

                {/* Lista de Documentos Solicitados */}
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
                            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-medium'
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

                {/* Botões de Ação da Linha */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botão Copiar Mensagem de Notificação */}
                    <button
                      type="button"
                      onClick={() => handleCopiarMensagemSisSedur(c)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      {copiadoId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiadoId === c.id ? 'Notificação Copiada!' : 'Copiar Notificação Requerente'}
                    </button>

                    {/* Botão Copiar Despacho de Devolução / Arquivamento */}
                    <button
                      type="button"
                      onClick={() => handleCopiarDespachoDevolucao(c)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      {copiadoDespachoId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-slate-600" />}
                      {copiadoDespachoId === c.id ? 'Despacho Copiado!' : 'Copiar Despacho p/ Parecer'}
                    </button>

                    {dias < 0 && !todosEntregues && (
                      <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                        <ArrowRightLeft className="w-3.5 h-3.5" /> Devolver processo à {c.setor_origem}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Botão Editar Acompanhamento */}
                    <button
                      type="button"
                      onClick={() => handleAbrirEdicao(c)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar Acompanhamento"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Botão Excluir Acompanhamento */}
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
            );
          })
        )}
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO DE COMUNICAÇÃO EXTERNA */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                {editandoId ? <Pencil className="w-4 h-4 text-blue-600" /> : <SendHorizontal className="w-4 h-4 text-emerald-600" />}
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
                {/* Processo */}
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

                {/* Tipo de Assunto Ambiental */}
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

                {/* Interessado */}
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

                {/* Setor de Origem */}
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

                {/* Controle de Prorrogações Concedidas */}
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

                {/* Data de Envio */}
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

                {/* Prazo em dias */}
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
                  <strong>Atenção:</strong> Processo no limite regulamentar (2 prorrogações). Caso não haja atendimento, os botões de cópia já gerarão o texto de indeferimento e a cota sugerindo arquivamento.
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
