// src/components/Step3Documentos.tsx
import React, { useMemo } from 'react';
import { FileCheck, CheckSquare, Square, CheckCheck, RotateCcw } from 'lucide-react';
import { ProcessoFormData } from '../types';
import { DOCUMENTOS_BASE_CAMACARI, DocumentoBaseItem } from '../data/normativasCamacari';

interface Step3Props {
  formData: ProcessoFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProcessoFormData>>;
}

export const Step3Documentos: React.FC<Step3Props> = ({ formData, setFormData }) => {
  // Filtra os documentos aplicáveis (exibe os itens 16 e 17 somente em Renovação de LAS)
  const docsAplicaveis = useMemo(() => {
    return DOCUMENTOS_BASE_CAMACARI.filter((doc: DocumentoBaseItem) => {
      if (doc.somenteRenovacao && formData.modalidade !== 'RENOVACAO_LAS') {
        return false;
      }
      return true;
    });
  }, [formData.modalidade]);

  const docsObrigatorios = useMemo(
    () => docsAplicaveis.filter((d: DocumentoBaseItem) => d.obrigatorio),
    [docsAplicaveis]
  );

  const obrigatoriosConferidos = useMemo(
    () => docsObrigatorios.filter((d: DocumentoBaseItem) => formData.documentos_conferidos.includes(d.id)),
    [docsObrigatorios, formData.documentos_conferidos]
  );

  const toggleDoc = (id: number) => {
    setFormData(prev => {
      const existe = prev.documentos_conferidos.includes(id);
      const novaLista = existe
        ? prev.documentos_conferidos.filter(d => d !== id)
        : [...prev.documentos_conferidos, id];
      return { ...prev, documentos_conferidos: novaLista };
    });
  };

  // Marca com 1 clique todos os itens obrigatórios aplicáveis
  const marcarKitPadrao = () => {
    const idsPadrao = docsObrigatorios.map((d: DocumentoBaseItem) => d.id);
    setFormData(prev => ({
      ...prev,
      documentos_conferidos: idsPadrao,
      status_parecer: 'DEFERIMENTO',
    }));
  };

  const desmarcarTodos = () => {
    setFormData(prev => ({ ...prev, documentos_conferidos: [] }));
  };

  const percentualConcluido = docsAplicaveis.length > 0
    ? Math.round((formData.documentos_conferidos.length / docsAplicaveis.length) * 100)
    : 0;

  const instrucaoCompleta = docsObrigatorios.length > 0 && obrigatoriosConferidos.length === docsObrigatorios.length;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-slate-700" />
          Etapa 3: Checklist de Conferência Documental (SEDUR)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Marque os documentos que foram efetivamente juntados aos autos do SIS-SEDUR. Apenas os itens marcados como obrigatórios travam a instrução.
        </p>
      </div>

      {/* Card da Barra de Progresso */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-800">
            Instrução Processual: {percentualConcluido}% ({formData.documentos_conferidos.length} de {docsAplicaveis.length} conferidos)
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full self-start sm:self-auto ${
              instrucaoCompleta
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {instrucaoCompleta
              ? 'Processo plenamente instruído'
              : `Faltam ${docsObrigatorios.length - obrigatoriosConferidos.length} documento(s) obrigatório(s)`}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              instrucaoCompleta ? 'bg-emerald-600' : 'bg-amber-500'
            }`}
            style={{ width: `${percentualConcluido}%` }}
          />
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap justify-between items-center pt-2 gap-2">
          <button
            type="button"
            onClick={marcarKitPadrao}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            Marcar Kit Padrão Apresentado
          </button>

          <button
            type="button"
            onClick={desmarcarTodos}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 underline font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar seleção
          </button>
        </div>
      </div>

      {/* Grid de Itens do Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {docsAplicaveis.map((doc: DocumentoBaseItem) => {
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
                  <span className="ml-2 text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                    Obrigatório
                  </span>
                )}
                {doc.somenteRenovacao && (
                  <span className="ml-2 text-[10px] uppercase font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                    Renovação
                  </span>
                )}
                {!doc.obrigatorio && (
                  <span className="ml-2 text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    Condicional
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
