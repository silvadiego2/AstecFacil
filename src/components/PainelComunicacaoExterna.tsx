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
  Calendar,
  Building2,
  CheckSquare,
  Square,
  ArrowRightLeft
} from 'lucide-react';
import { ComunicacaoExterna, DocumentoNotificacao } from '../types';

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
  const [comunicacoes, setComunicacoes] = useState<ComunicacaoExterna[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  
  // Modal de Cadastro/Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [novoProcesso, setNovoProcesso] = useState('');
  const [novoInteressado, setNovoInteressado] = useState('');
  const [novoSetor, setNovoSetor] = useState('CLA');
  const [novaDataEnvio, setNovaDataEnvio] = useState(new Date().toISOString().split('T')[0]);
  const [novoPrazoDias, setNovoPrazoDias] = useState(60);
  const [novoTextoDocs, setNovoTextoDocs] = useState('');
  const [novasObs, setNovasObs] = useState('');

  const [copiadoId, setCopiadoId] = useState<string | null>(null);

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

  const salvarLista = (novaLista: ComunicacaoExterna[]) => {
    setComunicacoes(novaLista);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    } catch (e) {
      console.error(e);
    }
  };

  // Criação de Nova Notificação
  const handleCriarComunicacao = () => {
    if (!novoProcesso.trim() || !novoInteressado.trim()) {
      alert('Informe o Número do Processo e o Interessado.');
      return;
    }

    const linhasDocs = novoTextoDocs
      .split('\n')
      .map(l => l.trim().replace(/^[-•*0-9.]+\s*/, ''))
      .filter(Boolean);

    const docsFormatados: DocumentoNotificacao[] = linhasDocs.length > 0
      ? linhasDocs.map((nome, idx) => ({
          id: `doc-${Date.now()}-${idx}`,
          nome,
          entregue: false,
        }))
      : [{ id: `doc-${Date.now()}-0`, nome: 'Complementação de instrução documental', entregue: false }];

    const dataLimiteCalculada = calcularDataLimite(novaDataEnvio, novoPrazoDias);

    const novaCom: ComunicacaoExterna = {
      id: `com-${Date.now()}`,
      numero_processo: novoProcesso.trim(),
      interessado: novoInteressado.trim(),
      setor_origem: novoSetor,
      data_envio: novaDataEnvio,
      prazo_dias: novoPrazoDias,
      data_limite: dataLimiteCalculada,
      documentos: docsFormatados,
      observacoes: novasObs.trim(),
      created_at: new Date().toISOString(),
    };

    salvarLista([novaCom, ...comunicacoes]);
    setModalAberto(false);
    setNovoProcesso('');
    setNovoInteressado('');
    setNovoTextoDocs('');
    setNovasObs('');
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

  // Copia o texto formal para colar diretamente na aba Comunicação Externa do SIS-SEDUR
  const handleCopiarMensagemSisSedur = (c: ComunicacaoExterna) => {
    const pendentes = c.documentos.filter(d => !d.entregue).map((d, i) => `  ${i + 1}. ${d.nome}`).join('\n');
    const dataLimiteFmt = c.data_limite.split('-').reverse().join('/');

    const msg = `NOTIFICAÇÃO ADMINISTRATIVA - SEDUR/ASTEC
Processo SIS-SEDUR nº: ${c.numero_processo}
Interessado: ${c.interessado}
Setor: ${c.setor_origem}

Prezado(a) Requerente,

Para fins de instrução técnica e continuidade da análise do processo em epígrafe, solicitamos a juntada aos autos, no prazo improrrogável de ${c.prazo_dias} dias (até ${dataLimiteFmt}), dos seguintes documentos e esclarecimentos:

${pendentes || '  1. Regularização de documentos pendentes.'}

Informamos que, esgotado o prazo assinalado sem o devido atendimento, os autos serão devolvidos ao setor de origem (${c.setor_origem}) para indeferimento e arquivamento nos termos da legislação municipal.

Assessoria Técnica - ASTEC / SEDUR
Prefeitura Municipal de Camaçari`;

    navigator.clipboard.writeText(msg);
    setCopiadoId(c.id);
    setTimeout(() => setCopiadoId(null), 3000);
  };

  // EXPORTAÇÃO COMPLETA PARA EXCEL (.XLS FORMATADO)
  const handleExportarExcel = () => {
    if (comunicacoes.length === 0) {
      alert('Não há processos cadastrados para exportar.');
      return;
    }

    const dataHoje = new Date().toISOString().split('T')[0];

    // Montagem da tabela HTML para o Excel
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
              <th>Interessado / Requerente</th>
              <th>Setor de Devolução</th>
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
          <td>${c.interessado}</td>
          <td>${c.setor_origem}</td>
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

  // Cálculos de Resumo (KPIs)
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
      const matchBusca = 
        c.numero_processo.toLowerCase().includes(termo) ||
        c.interessado.toLowerCase().includes(termo) ||
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
            onClick={() => setModalAberto(true)}
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
            placeholder="Buscar por número do processo, interessado ou documento solicitado..."
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
                {/* Linha Superior: Processo, Setor e Alertas */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {c.numero_processo}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Origem: {c.setor_origem}
                      </span>
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

                {/* Lista de Documentos Solicitados para o Requerente */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Documentos Exigidos na Notificação (Clique para marcar quando o requerente anexar):
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopiarMensagemSisSedur(c)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      {copiadoId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiadoId === c.id ? 'Texto Copiado!' : 'Copiar Mensagem SIS-SEDUR'}
                    </button>

                    {dias < 0 && !todosEntregues && (
                      <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                        <ArrowRightLeft className="w-3.5 h-3.5" /> Devolver processo à {c.setor_origem}
                      </span>
                    )}
                  </div>

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
            );
          })
        )}
      </div>

      {/* MODAL DE CADASTRO DE NOVA COMUNICAÇÃO EXTERNA */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <SendHorizontal className="w-4 h-4 text-emerald-600" />
                Cadastrar Comunicação Externa no SIS-SEDUR
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
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
                    <option value={30}>30 dias</option>
                    <option value={60}>60 dias (Padrão)</option>
                    <option value={90}>90 dias</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Documentos Solicitados (1 por linha):
                </label>
                <textarea
                  rows={4}
                  placeholder="Exemplo:&#10;Certidão de matrícula e ônus reais atualizada do RGI&#10;Certificado de Licença do Corpo de Bombeiros (AVCB)&#10;Projetos aprovados pela EMBASA"
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
                  placeholder="Ex: Requerente alegou processo judicial no imóvel"
                  value={novasObs}
                  onChange={e => setNovasObs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCriarComunicacao}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
              >
                Salvar Acompanhamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
