// src/components/AnalisadorDocumental.tsx
import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCheck2, 
  AlertCircle, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  ArrowRight,
  ShieldCheck,
  Building,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { DocumentoAnexado, ResultadoAuditoriaSedur } from '../types/analiseDocumental';
import { 
  classificarArquivoAnexado, 
  executarAuditoriaDocumentalSedur 
} from '../utils/analisadorDocumentalSedur';

interface AnalisadorDocumentalProps {
  modalidade: string;
  setorDestino: string;
  onAplicarChecklist?: (documentosAtendidos: string[]) => void;
  onTransferirParaParecer?: (resultado: ResultadoAuditoriaSedur) => void;
}

export const AnalisadorDocumental: React.FC<AnalisadorDocumentalProps> = ({
  modalidade,
  setorDestino,
  onAplicarChecklist,
  onTransferirParaParecer,
}) => {
  const [anexos, setAnexos] = useState<DocumentoAnexado[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [resultadoAuditoria, setResultadoAuditoria] = useState<ResultadoAuditoriaSedur | null>(null);
  const [copiado, setCopiado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipulação de arquivos via upload ou drag & drop
  const processarArquivos = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const novosAnexos: DocumentoAnexado[] = Array.from(files).map(file => {
      const analisePrevia = classificarArquivoAnexado(file.name);
      return {
        id: `anexo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        arquivoNome: file.name,
        tamanhoBytes: file.size,
        tipoMime: file.type || 'application/octet-stream',
        dataUpload: new Date().toISOString(),
        categoriaIdentificada: analisePrevia.categoria,
        itemChecklistId: analisePrevia.itemChecklist,
        statusConformidade: analisePrevia.status,
        observacoesAnalise: analisePrevia.observacao,
      };
    });

    const listaFinal = [...anexos, ...novosAnexos];
    setAnexos(listaFinal);

    // Executa a auditoria automática com os novos anexos
    const auditoria = executarAuditoriaDocumentalSedur(listaFinal, modalidade, setorDestino);
    setResultadoAuditoria(auditoria);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processarArquivos(e.dataTransfer.files);
  };

  const handleRemoverAnexo = (id: string) => {
    const atualizados = anexos.filter(a => a.id !== id);
    setAnexos(atualizados);
    if (atualizados.length > 0) {
      setResultadoAuditoria(executarAuditoriaDocumentalSedur(atualizados, modalidade, setorDestino));
    } else {
      setResultadoAuditoria(null);
    }
  };

  const handleAplicarAoChecklist = () => {
    if (!resultadoAuditoria) return;
    const atendidos = anexos
      .filter(a => a.statusConformidade === 'CONFORME' && a.itemChecklistId)
      .map(a => a.itemChecklistId as string);

    if (onAplicarChecklist) {
      onAplicarChecklist(atendidos);
    }
    alert(`Sucesso! ${atendidos.length} documentos identificados foram aplicados ao Checklist oficial da SEDUR.`);
  };

  const handleCopiarTextoAuditoria = () => {
    if (!resultadoAuditoria) return;

    const texto = `RELATÓRIO DE AUDITORIA DOCUMENTAL - SEDUR CAMAÇARI
Modalidade: ${modalidade} | Setor: ${setorDestino}
Data: ${new Date().toLocaleDateString('pt-BR')}

1. CONFERÊNCIA DOS DOCUMENTOS DA COLUNA C (SEDUR/CLA):
Total de documentos obrigatórios analisados: ${resultadoAuditoria.totalObrigatorios}
Documentos atendidos: ${resultadoAuditoria.atendidosObrigatorios}
Documentos pendentes: ${resultadoAuditoria.pendentesObrigatorios.length}

2. DOCUMENTOS PENDENTES DE JUNTADA:
${resultadoAuditoria.pendentesObrigatorios.map((p, i) => `  ${i + 1}.${p}`).join('\n') || '  - Nenhuma pendência documental identificada.'}

3. RESSALVAS TÉCNICAS:
${resultadoAuditoria.ressalvasIdentificadas.map(r => `  - ${r}`).join('\n') || '  - Nenhuma ressalva observada.'}

4. ENQUADRAMENTO E FUNDAMENTAÇÃO LEGAL:
${resultadoAuditoria.fundamentacaoLegal}

5. CONCLUSÃO TÉCNICA ASTEC:
${resultadoAuditoria.resumoParecer}`;

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Caixa de Entrada de Arquivos (Drag & Drop) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.docx,.odt,.txt"
          onChange={e => processarArquivos(e.target.files)}
          className="hidden"
        />
        <UploadCloud className="w-12 h-12 text-blue-600 mx-auto mb-3 animate-pulse" />
        <h3 className="text-sm font-bold text-slate-800">
          Anexe aqui os documentos do processo SIS-SEDUR para análise automática
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
          Arraste e solte ou clique para selecionar os arquivos (PDFs, imagens de certidões, contratos, projetos e requerimentos). O sistema fará a conferência contra as exigências da SEDUR Camaçari.
        </p>
      </div>

      {/* Lista de Documentos Anexados e Classificados */}
      {anexos.length > 0 && (
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Documentos Anexados e Triados ({anexos.length})
              </h4>
              <p className="text-[11px] text-slate-500">
                Classificação automática baseada na nomenclatura oficial dos atos da CLA/SEDUR.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAnexos([]);
                setResultadoAuditoria(null);
              }}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar Anexos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {anexos.map(doc => (
              <div
                key={doc.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 truncate" title={doc.arquivoNome}>
                      {doc.arquivoNome}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {doc.categoriaIdentificada}
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      ↳ {doc.itemChecklistId}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    {doc.observacoesAnalise}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoverAnexo(doc.id);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  title="Remover anexo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Painel de Resultado da Auditoria Documental da SEDUR */}
      {resultadoAuditoria && (
        <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Resultado da Análise Técnica Especializada
              </span>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Auditoria de Conformidade Legal — SEDUR Camaçari
              </h3>
            </div>

            {/* Badge de Encaminhamento */}
            <div>
              {resultadoAuditoria.aptoParaDeferimento ? (
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  APTO PARA DEFERIMENTO ({setorDestino})
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  NECESSITA DILIGÊNCIA / NOTIFICAÇÃO
                </span>
              )}
            </div>
          </div>

          {/* Métricas da Auditoria */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono">
              <span className="text-slate-500 block text-[10px]">ANEXOS PROCESSADOS</span>
              <span className="text-lg font-bold text-slate-800">{resultadoAuditoria.totalAnexados}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono">
              <span className="text-slate-500 block text-[10px]">OBRIGATÓRIOS (COLUNA C)</span>
              <span className="text-lg font-bold text-slate-800">{resultadoAuditoria.totalObrigatorios}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-mono">
              <span className="text-emerald-700 block text-[10px]">ATENDIDOS</span>
              <span className="text-lg font-bold text-emerald-800">{resultadoAuditoria.atendidosObrigatorios}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 font-mono">
              <span className="text-rose-700 block text-[10px]">PENDÊNCIAS</span>
              <span className="text-lg font-bold text-rose-800">{resultadoAuditoria.pendentesObrigatorios.length}</span>
            </div>
          </div>

          {/* Lista de Pendências Identificadas */}
          {resultadoAuditoria.pendentesObrigatorios.length > 0 && (
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
              <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                Documentos Obrigatórios Não Identificados nos Anexos:
              </h5>
              <ul className="list-disc list-inside text-xs text-rose-800 space-y-1 font-medium">
                {resultadoAuditoria.pendentesObrigatorios.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
              <p className="text-[11px] text-rose-700 pt-1 italic">
                ↳ Estes itens serão transportados diretamente para a lista de diligências e para a notificação do SIS-SEDUR.
              </p>
            </div>
          )}

          {/* Ressalvas e Regras Especiais */}
          {resultadoAuditoria.ressalvasIdentificadas.length > 0 && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
              <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Diretrizes e Regras Especiais da SEDUR Camaçari:
              </h5>
              <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5">
                {resultadoAuditoria.ressalvasIdentificadas.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Resumo da Conclusão Técnica */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Fundamentação e Conclusão Sugerida para o Parecer:
            </label>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-mono">
              <p className="mb-2"><strong>Base Legal:</strong> {resultadoAuditoria.fundamentacaoLegal}</p>
              <p>{resultadoAuditoria.resumoParecer}</p>
            </div>
          </div>

          {/* Botões de Ação Integrada */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCopiarTextoAuditoria}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiado ? 'Relatório Copiado!' : 'Copiar Relatório de Análise'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAplicarAoChecklist}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar Checklist Automaticamente
              </button>

              {onTransferirParaParecer && (
                <button
                  type="button"
                  onClick={() => onTransferirParaParecer(resultadoAuditoria)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  Avançar para Parecer <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
