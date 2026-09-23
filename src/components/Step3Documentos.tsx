// src/components/Step3Documentos.tsx
import React, { useMemo } from 'react';
import { FileCheck, CheckSquare, Square, CheckCheck, RotateCcw, Sparkles } from 'lucide-react';
import { ProcessoFormData } from '../types';
import { 
  DOCUMENTOS_BASE_CAMACARI, 
  DocumentoBaseItem,
  verificarDocumentoObrigatorioSedur 
} from '../data/normativasCamacari';

interface Step3Props {
  formData: ProcessoFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProcessoFormData>>;
}

export const Step3Documentos: React.FC<Step3Props> = ({ formData, setFormData }) => {
  const tipologia = formData.tipologia_atividade || 'GERAL';
  const modalidade = formData.modalidade;
  const isRenovacao = modalidade === 'RENOVACAO_LAS';
  const isInexigibilidade = modalidade === 'INEXIGIBILIDADE';

  // Filtra os documentos que se aplicam ao ato e à tipologia
  const docsAplicaveis = useMemo(() => {
    return DOCUMENTOS_BASE_CAMACARI.filter((doc: DocumentoBaseItem) => {
      if (doc.somenteRenovacao && !isRenovacao) return false;
      if (isInexigibilidade && doc.dispensadoEmInexigibilidade) return false;
      if (doc.somenteTipologias && !doc.somenteTipologias.includes(tipologia)) return false;
      return true;
    });
  }, [tipologia, modalidade, isRenovacao, isInexigibilidade]);

  // Documentos obrigatórios (Coluna C = "x" na planilha da SEDUR)
  const docsObrigatorios = useMemo(() => {
    return docsAplicaveis.filter(d => verificarDocumentoObrigatorioSedur(d, modalidade, tipologia));
  }, [docsAplicaveis, modalidade, tipologia]);

  const obrigatoriosConferidos = useMemo(() => {
    return docsObrigatorios.filter(d => formData.documentos_conferidos.includes(d.id));
  }, [docsObrigatorios, formData.documentos_conferidos]);

  const toggleDoc = (id: number) => {
    setFormData(prev => {
      const existe = prev.documentos_conferidos.includes(id);
      const novaLista = existe
        ? prev.documentos_conferidos.filter(d => d !== id)
        : [...prev.documentos_conferidos, id];
      return { ...prev, documentos_conferidos: novaLista };
    });
  };

  const marcarKitPadrao = () => {
    const idsPadrao = docsObrigatorios.map(d => d.id);
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
          Etapa 3: Checklist Documental SEDUR Camaçari (CLA)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Relação oficial de documentos para <strong>{
            modalidade === 'INEXIGIBILIDADE' ? 'Inexigibilidade de Licenciamento' :
            tipologia === 'POSTO_COMBUSTIVEL' ? 'Posto de Combustíveis (LAS)' :
            tipologia === 'MINERACAO' ? 'Mineração (LAS)' :
            tipologia === 'URBANISTICO' ? 'Empreendimentos Urbanísticos (LAS)' :
            tipologia === 'OBRA' ? 'Obras / Construção Civil (LAS)' :
            tipologia === 'ERB' ? 'Estação Rádio Base (ERB)' : 'Licenciamento Geral'
          }</strong>. Os itens obrigatórios seguem a coluna C ("x") das planilhas da SEDUR.
        </p>
      </div>

      {/* Card da Barra de Progresso */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Instrução Processual: {percentualConcluido}% ({formData.documentos_conferidos.length} de {docsAplicaveis.length} conferidos)
            {formData.documentos_conferidos.length > 0 && (
              <span className="text-[11px] font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-identificados
              </span>
            )}
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
              : `Faltam ${docsObrigatorios.length - obrigatoriosConferidos.length} documento(s) com "x" na SEDUR`}
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

        {/* Botões de Ação */}
        <div className="flex flex-wrap justify-between items-center pt-2 gap-2">
          <button
            type="button"
            onClick={marcarKitPadrao}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            Marcar Todos os Obrigatórios da SEDUR (Coluna C)
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

      {/* Grade de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {docsAplicaveis.map((doc: DocumentoBaseItem) => {
          const checked = formData.documentos_conferidos.includes(doc.id);
          const obrigatorio = verificarDocumentoObrigatorioSedur(doc, modalidade, tipologia);

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
                <span className="font-bold mr-1 text-slate-800">Item {doc.itemSedur}</span>
                <span> - {doc.nome}</span>
                {obrigatorio ? (
                  <span className="ml-2 text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                    Obrigatório (x)
                  </span>
                ) : (
                  <span className="ml-2 text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    Se couber
                  </span>
                )}
                {doc.somenteTipologias && (
                  <span className="ml-1.5 text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                    Específico
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
