// src/App.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Layers, 
  FileCheck2, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  History, 
  Trash2, 
  Search, 
  X,
  ShieldCheck
} from 'lucide-react';
import { ProcessoFormData } from './types';
import { Step1Identificacao } from './components/Step1Identificacao';
import { Step2Enquadramento } from './components/Step2Enquadramento';
import { Step3Documentos } from './components/Step3Documentos';
import { Step4Parecer } from './components/Step4Parecer';
import { listarProcessosSalvos, excluirProcesso } from './services/api';

const ESTADO_INICIAL: ProcessoFormData = {
  numero_processo: '',
  interessado: '',
  cnpj: '',
  endereco: '',
  bairro: '',
  cep: '',
  coordenadas: '',
  zona_urbanistica: 'ZOUC 1',
  area_m2: 0,
  tipoSolicitacao: 'NOVA_LICENCA',
  numeroLicencaAnterior: '',
  modalidade: 'DISPENSA',
  tipologia_atividade: 'GERAL',
  destinatario_parecer: 'CLA',
  cnae_principal: { codigo: '', descricao: '' },
  cnaes_secundarios: [],
  documentos_conferidos: [],
  status_parecer: 'DEFERIMENTO',
  texto_parecer: '',
  possui_atividade_industrial: false,
  declaracao_artesanal_bancada: false,
};

export default function App() {
  const [etapaAtual, setEtapaAtual] = useState<number>(1);
  const [formData, setFormData] = useState<ProcessoFormData>(ESTADO_INICIAL);
  const [modalHistorico, setModalHistorico] = useState<boolean>(false);
  const [processosSalvos, setProcessosSalvos] = useState<any[]>([]);
  const [buscaHistorico, setBuscaHistorico] = useState<string>('');
  const [loadingHistorico, setLoadingHistorico] = useState<boolean>(false);

  const carregarHistorico = async () => {
    setLoadingHistorico(true);
    try {
      const res = await listarProcessosSalvos(1, 20, buscaHistorico);
      setProcessosSalvos(res.dados || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistorico(false);
    }
  };

  useEffect(() => {
    if (modalHistorico) carregarHistorico();
  }, [modalHistorico, buscaHistorico]);

  const handleExcluirProcesso = async (id: number) => {
    if (!confirm(`Deseja realmente remover o registro #${id}?`)) return;
    try {
      await excluirProcesso(id);
      carregarHistorico();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCarregarRegistro = (proc: any) => {
    setFormData({
      id: proc.id,
      numero_processo: proc.numero_processo,
      interessado: proc.interessado,
      cnpj: proc.cnpj,
      endereco: proc.endereco,
      bairro: proc.bairro,
      coordenadas: proc.coordenadas,
      zona_urbanistica: proc.zona_urbanistica,
      area_m2: parseFloat(proc.area_m2) || 0,
      tipoSolicitacao: proc.modalidade === 'RENOVACAO_LAS' ? 'RENOVACAO' : 'NOVA_LICENCA',
      numeroLicencaAnterior: proc.numeroLicencaAnterior || '',
      modalidade: proc.modalidade,
      tipologia_atividade: proc.tipologia_atividade || 'GERAL',
      destinatario_parecer: proc.destinatario_parecer || (proc.modalidade === 'RENOVACAO_LAS' ? 'GABINETE' : 'CLA'),
      cnae_principal: { codigo: '', descricao: '' },
      cnaes_secundarios: [],
      documentos_conferidos: proc.documentos_conferidos || [],
      status_parecer: proc.status_parecer || 'DEFERIMENTO',
      texto_parecer: proc.texto_parecer,
      possui_atividade_industrial: false,
      declaracao_artesanal_bancada: false,
    });
    setModalHistorico(false);
    setEtapaAtual(4);
  };

  const steps = [
    { num: 1, label: 'Identificação e CNPJ', icon: Building },
    { num: 2, label: 'Enquadramento Legal', icon: Layers },
    { num: 3, label: 'Checklist SEDUR', icon: FileCheck2 },
    { num: 4, label: 'Parecer Técnico', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      <header className="bg-slate-900 text-white border-b-4 border-emerald-600 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ASTEC Fácil - SEDUR Camaçari</h1>
              <p className="text-xs text-slate-300">
                Assessoria Técnica Ambiental Municipal | Triagem de DLA, LAS, Inexigibilidade e Renovação
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalHistorico(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 border border-slate-700 transition"
          >
            <History className="w-4 h-4 text-emerald-400" />
            Processos Salvos
          </button>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1">
        <div className="bg-white rounded-2xl p-4 mb-8 shadow-sm border border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {steps.map(s => {
              const Icon = s.icon;
              const ativo = etapaAtual === s.num;
              const concluido = etapaAtual > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setEtapaAtual(s.num)}
                  className={`p-3 rounded-xl flex items-center gap-3 text-left transition ${
                    ativo
                      ? 'bg-slate-900 text-white shadow'
                      : concluido
                      ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      ativo
                        ? 'bg-emerald-500 text-slate-950'
                        : concluido
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {s.num}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                      Etapa {s.num}
                    </div>
                    <div className="text-xs font-semibold">{s.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
          {etapaAtual === 1 && (
            <Step1Identificacao formData={formData} setFormData={setFormData} />
          )}
          {etapaAtual === 2 && (
            <Step2Enquadramento formData={formData} setFormData={setFormData} />
          )}
          {etapaAtual === 3 && (
            <Step3Documentos formData={formData} setFormData={setFormData} />
          )}
          {etapaAtual === 4 && (
            <Step4Parecer
              formData={formData}
              setFormData={setFormData}
              onLimparFormulario={() => {
                setFormData(ESTADO_INICIAL);
                setEtapaAtual(1);
              }}
            />
          )}

          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              disabled={etapaAtual === 1}
              onClick={() => setEtapaAtual(p => Math.max(1, p - 1))}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            {etapaAtual < 4 && (
              <button
                type="button"
                onClick={() => setEtapaAtual(p => Math.min(4, p + 1))}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 transition shadow"
              >
                Próxima Etapa
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>

      {modalHistorico && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                Processos Cadastrados
              </h3>
              <button
                type="button"
                onClick={() => setModalHistorico(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar por número do processo, CNPJ ou interessado..."
                  value={buscaHistorico}
                  onChange={e => setBuscaHistorico(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-600"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {loadingHistorico ? (
                <p className="text-center py-8 text-sm text-slate-500">Carregando processos...</p>
              ) : processosSalvos.length === 0 ? (
                <p className="text-center py-8 text-sm text-slate-500">
                  Nenhum processo salvo encontrado.
                </p>
              ) : (
                processosSalvos.map(proc => (
                  <div
                    key={proc.id}
                    className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 bg-white transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {proc.numero_processo}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          proc.modalidade === 'RENOVACAO_LAS' 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {proc.modalidade === 'RENOVACAO_LAS' ? 'RENOVAÇÃO LAS' : proc.modalidade}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-700 mt-1">
                        {proc.interessado}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        CNPJ: {proc.cnpj} | {proc.bairro} - Camaçari
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCarregarRegistro(proc)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Visualizar / Carregar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluirProcesso(proc.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
