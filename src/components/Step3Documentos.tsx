import React, { useMemo } from 'react';
import { FileCheck, CheckSquare, Square, AlertOctagon } from 'lucide-react';
import { ProcessoFormData } from '../types';
import { DOCUMENTOS_BASE_CAMACARI } from '../data/normativasCamacari';

interface Step3Props {
  formData: ProcessoFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProcessoFormData>>;
}

export const Step3Documentos: React.FC<Step3Props> = ({ formData, setFormData }) => {
  const toggleDoc = (id: number) => {
    setFormData(prev => {
      const existe = prev.documentos_conferidos.includes(id);
      const novaLista = existe
        ? prev.documentos_conferidos.filter(d => d !== id)
        : [...prev.documentos_conferidos, id];
      return { ...prev, documentos_conferidos: novaLista };
    });
  };

  const selecionarTodos = () => {
    setFormData(prev => ({
      ...prev,
      documentos_conferidos: DOCUMENTOS_BASE_CAMACARI.map(d => d.id),
    }));
  };

  const desmarcarTodos = () => {
    setFormData(prev => ({ ...prev, documentos_conferidos: [] }));
  };

  // Cálculo de completude com base nos obrigatórios
  const docsObrigatorios = useMemo(() => DOCUMENTOS_BASE_CAMACARI.filter(d => d.obrigatorio), []);
  const obrigatoriosConferidos = useMemo(
    () => docsObrigatorios.filter(d => formData.documentos_conferidos.includes(d.id)),
    [docsObrigatorios, formData.documentos_conferidos]
  );

  const percentualConcluido = Math.round(
    (formData.documentos_conferidos.length / DOCUMENTOS_BASE_CAMACARI.length) * 100
  );
  const instrucaoCompleta = obrigatoriosConferidos.length === docsObrigatorios.length;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-slate-700" />
          Etapa 3: Checklist Interativo de Documentação SEDUR
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Conferência dos 16 itens obrigatórios para emissão de atos ambientais da SEDUR Camaçari.
        </p>
      </div>

      {/* Card da Barra de Progresso */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800">
            Nível de Instrução Processual: {percentualConcluido}%
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              instrucaoCompleta
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {instrucaoCompleta
              ? 'Processo plenamente instruído'
              : `Pendentes: ${docsObrigatorios.length - obrigatoriosConferidos.length} documento(s) obrigatório(s)`}
          </span>
        </div>

        {/* Barra de Progresso com Tailwind */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percentualConcluido === 100
                ? 'bg-emerald-600'
                : percentualConcluido >= 70
                ? 'bg-blue-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${percentualConcluido}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-500">
            {formData.documentos_conferidos.length} de {DOCUMENTOS_BASE_CAMACARI.length} itens conferidos
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selecionarTodos}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
            >
              Marcar todos
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={desmarcarTodos}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
            >
              Desmarcar todos
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Itens do Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DOCUMENTOS_BASE_CAMACARI.map(doc => {
          const checked = formData.documentos_conferidos.includes(doc.id);
          return (
            <div
              key={doc.id}
              onClick={() => toggleDoc(doc.id)}
              className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition select-none ${
                checked
                  ? 'bg-emerald-50/60 border-emerald-300 text-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <button type="button" className="mt-0.5 text-emerald-600 flex-shrink-0">
                {checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
              </button>
              <div className="text-xs leading-relaxed">
                <span className="font-bold mr-1.5 text-slate-800">#{doc.id}</span>
                <span>{doc.nome}</span>
                {doc.obrigatorio && (
                  <span className="ml-2 text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                    Obrigatório
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
