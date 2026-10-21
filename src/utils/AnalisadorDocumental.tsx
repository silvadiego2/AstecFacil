// src/components/AnalisadorDocumental.tsx
import React, { useState, useRef, useEffect } from 'react';
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
  Copy,
  Check,
  Layers,
  PowerOff
} from 'lucide-react';
import { DocumentoAnexado, ResultadoAuditoriaSedur } from '../types/analiseDocumental';
import { 
  classificarArquivoAnexado, 
  executarAuditoriaDocumentalSedur,
  normalizarTexto 
} from '../utils/analisadorDocumentalSedur';
import { CHECKLIST_SEDUR_EXIGENCIAS } from '../utils/constants';

interface AnalisadorDocumentalProps {
  modalidade: string;
  setorDestino: string;
  onAplicarChecklist?: (documentosAtendidos: string[]) => void;
  onTransferirParaParecer?: (resultado: ResultadoAuditoriaSedur) => void;
  onAlterarModalidade?: (novaModalidade: string) => void;
}

export const AnalisadorDocumental: React.FC<AnalisadorDocumentalProps> = ({
  modalidade: modalidadeInicial,
  setorDestino,
  onAplicarChecklist,
  onTransferirParaParecer,
  onAlterarModalidade,
}) => {
  const [modalidadeAtiva, setModalidadeAtiva] = useState<string>(modalidadeInicial || 'RENOVACAO_LAS');
  const [anexos, setAnexos] = useState<DocumentoAnexado[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [resultadoAuditoria, setResultadoAuditoria] = useState<ResultadoAuditoriaSedur | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [alertaDetectadoBaixa, setAlertaDetectadoBaixa] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modalidadeInicial && modalidadeInicial !== modalidadeAtiva) {
      setModalidadeAtiva(modalidadeInicial);
      rodarAuditoria(anexos, modalidadeInicial);
    }
  }, [modalidadeInicial]);

  const checklistDisponivel = CHECKLIST_SEDUR_EXIGENCIAS[modalidadeAtiva] || CHECKLIST_SEDUR_EXIGENCIAS['RENOVACAO_LAS'];

  const rodarAuditoria = (lista: DocumentoAnexado[], mod: string = modalidadeAtiva) => {
    if (lista.length > 0) {
      setResultadoAuditoria(executarAuditoriaDocumentalSedur(lista, mod, setorDestino));
    } else {
      setResultadoAuditoria(null);
    }
  };

  const handleMudarModalidade = (novaMod: string) => {
    setModalidadeAtiva(novaMod);
    setAlertaDetectadoBaixa(false);
    if (onAlterarModalidade) onAlterarModalidade(novaMod);
    rodarAuditoria(anexos, novaMod);
  };

  const processarArquivos = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let detectouTermoBaixa = false;

    const novosAnexos: DocumentoAnexado[] = Array.from(files).map(file => {
      const nomeNorm = normalizarTexto(file.name);
      if (
        nomeNorm.includes('baixa') || 
        nomeNorm.includes('encerramento') || 
        nomeNorm.includes('desativacao') ||
        nomeNorm.includes('desmobilizacao')
      ) {
        detectouTermoBaixa = true;
      }

      const analisePrevia = classificarArquivoAnexado(file.name, modalidadeAtiva);
      return {
        id: `anexo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        arquivoNome: file.name,
        tamanhoBytes: file.size,
        tipoMime: file.type || 'application/pdf',
        dataUpload: new Date().toISOString(),
        categoriaIdentificada: analisePrevia.categoria,
        itemChecklistId: analisePrevia.itemChecklist || undefined, // <--- Evita null
        statusConformidade: analisePrevia.status,
        observacoesAnalise: analisePrevia.observacao,
      };
    });

    if (detectouTermoBaixa && modalidadeAtiva !== 'BAIXA_LICENCA') {
      setAlertaDetectadoBaixa(true);
    }

    const listaFinal = [...anexos, ...novosAnexos];
    setAnexos(listaFinal);
    rodarAuditoria(listaFinal, modalidadeAtiva);
  };

  const handleAlterarItemManual = (anexoId: string, itemChecklistId: string) => {
    const itemEncontrado = checklistDisponivel.find(i => i.id === itemChecklistId);
    
    const atualizados: DocumentoAnexado[] = anexos.map(anexo => {
      if (anexo.id === anexoId) {
        return {
          ...anexo,
          itemChecklistId: itemChecklistId ? itemChecklistId : undefined, // <--- Evita null
          categoriaIdentificada: itemEncontrado ? itemEncontrado.nome.split(' ')[0].toUpperCase() : 'MANUAL',
          statusConformidade: itemChecklistId ? 'CONFORME' : 'PENDENTE',
          observacoesAnalise: itemEncontrado ? `Classificado manualmente como: ${itemEncontrado.nome}` : 'Aguardando classificação'
        };
      }
      return anexo;
    });

    setAnexos(atualizados);
    rodarAuditoria(atualizados, modalidadeAtiva);
  };

  const handleAdicionarItemAoPdfUnificado = (itemChecklistId: string) => {
    if (!itemChecklistId) return;
    const item = checklistDisponivel.find(i => i.id === itemChecklistId);
    if (!item) return;

    if (anexos.some(a => a.itemChecklistId === item.id)) {
      alert('Este documento já consta na lista de anexos identificados.');
      return;
    }

    const novoItem: DocumentoAnexado = {
      id: `anexo-unificado-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      arquivoNome: `[Parte do PDF Unificado] ${item.nome}`,
      tamanhoBytes: 0,
      tipoMime: 'application/pdf',
      dataUpload: new Date().toISOString(),
      categoriaIdentificada: item.nome.split(' ')[0].toUpperCase(),
      itemChecklistId: item.id,
      statusConformidade: 'CONFORME',
      observacoesAnalise: `Documento identificado dentro do arquivo consolidado (PDF24).`
    };

    const listaAtualizada = [...anexos, novoItem];
    setAnexos(listaAtualizada);
    rodarAuditoria(listaAtualizada, modalidadeAtiva);
  };

  const handleRemoverAnexo = (id: string) => {
    const atualizados = anexos.filter(a => a.id !== id);
    setAnexos(atualizados);
    rodarAuditoria(atualizados, modalidadeAtiva);
  };

  const handleCopiarTextoAuditoria = () => {
    if (!resultadoAuditoria) return;

    const texto = `RELATÓRIO DE AUDITORIA DOCUMENTAL - SEDUR CAMAÇARI
Modalidade: ${modalidadeAtiva.replace('_', ' ')} | Setor: ${setorDestino}
Data: ${new Date().toLocaleDateString('pt-BR')}

1. CONFERÊNCIA DOS DOCUMENTOS OBRIGATÓRIOS:
Total de exigências obrigatórias: ${resultadoAuditoria.totalObrigatorios}
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
      {/* SELETOR INTERATIVO DE MODALIDADE */}
      <div className="bg-slate-100 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-300">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-bold text-slate-800">Modalidade em Análise:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleMudarModalidade('RENOVACAO_LAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              modalidadeAtiva === 'RENOVACAO_LAS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Renovação de LAS
          </button>
          <button
            type="button"
            onClick={() => handleMudarModalidade('BAIXA_LICENCA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              modalidadeAtiva === 'BAIXA_LICENCA'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PowerOff className="w-3.5 h-3.5" />
            Baixa de Licença Ambiental
          </button>
          <button
            type="button"
            onClick={() => handleMudarModalidade('LAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              modalidadeAtiva === 'LAS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Nova LAS
          </button>
        </div>
      </div>

      {/* ALERTA INTELIGENTE PARA BAIXA DETECTADA */}
      {alertaDetectadoBaixa && (
        <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Documento de Baixa Detectado:</strong> Foram identificados arquivos de encerramento/desativação. Deseja alternar a análise para <strong>Baixa de Licença Ambiental</strong>?
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleMudarModalidade('BAIXA_LICENCA')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs whitespace-nowrap shadow-sm"
          >
            Alternar para Baixa de Licença
          </button>
        </div>
      )}

      {/* CAIXA DE UPLOAD */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); processarArquivos(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={e => processarArquivos(e.target.files)}
          className="hidden"
        />
        <UploadCloud className="w-10 h-10 text-blue-600 mx-auto mb-2 animate-pulse" />
        <h3 className="text-sm font-bold text-slate-800">
          Anexe aqui os documentos ou o PDF consolidado do processo SIS-SEDUR
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
          Arraste e solte arquivos individuais ou arquivos unificados (PDF24). A auditoria confere automaticamente os itens da <strong>{modalidadeAtiva.replace('_', ' ')}</strong>.
        </p>
      </div>

      {/* DECLARAÇÃO DE DOCUMENTOS EM PDF UNIFICADO */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-blue-950 font-semibold">
          <Layers className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span>Juntou os autos em um único arquivo (ex: PDF24)? Declare um documento contido nele:</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            defaultValue=""
            onChange={(e) => {
              handleAdicionarItemAoPdfUnificado(e.target.value);
              e.target.value = "";
            }}
            className="rounded-lg border-blue-300 bg-white text-slate-800 text-xs py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Selecionar documento do PDF...</option>
            {checklistDisponivel.map(item => (
              <option key={item.id} value={item.id}>{item.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LISTA DE ANEXOS */}
      {anexos.length > 0 && (
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Documentos Listados para Auditoria ({anexos.length})
              </h4>
              <p className="text-[11px] text-slate-500">
                Se algum arquivo não foi identificado automaticamente, ajuste o tipo no campo de seleção correspondente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setAnexos([]); setResultadoAuditoria(null); }}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar Todos
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {anexos.map(doc => (
              <div
                key={doc.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 truncate" title={doc.arquivoNome}>
                      {doc.arquivoNome}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    {doc.observacoesAnalise}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={doc.itemChecklistId || ''}
                    onChange={(e) => handleAlterarItemManual(doc.id, e.target.value)}
                    className="text-xs rounded-lg border-slate-300 py-1 px-2.5 text-slate-700 bg-white focus:ring-blue-500 focus:border-blue-500 font-medium max-w-[260px] truncate"
                  >
                    <option value="">Não identificado / Outros</option>
                    {checklistDisponivel.map(item => (
                      <option key={item.id} value={item.id}>{item.nome}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoverAnexo(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                    title="Remover anexo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAINEL DE AUDITORIA */}
      {resultadoAuditoria && (
        <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-lg p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Resultado da Análise Técnica Especializada
              </span>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Conformidade com o Checklist SEDUR Camaçari ({modalidadeAtiva.replace('_', ' ')})
              </h3>
            </div>

            <div>
              {resultadoAuditoria.aptoParaDeferimento ? (
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  APTO PARA DEFERIMENTO ({setorDestino})
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  NECESSITA DILIGÊNCIA / NOTIFICAÇÃO
                </span>
              )}
            </div>
          </div>

          {/* MÉTRICAS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono">
              <span className="text-slate-500 block text-[10px]">ANEXOS ANALISADOS</span>
              <span className="text-lg font-bold text-slate-800">{resultadoAuditoria.totalAnexados}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono">
              <span className="text-slate-500 block text-[10px]">EXIGÊNCIAS SEDUR</span>
              <span className="text-lg font-bold text-slate-800">{resultadoAuditoria.totalObrigatorios}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-mono">
              <span className="text-emerald-700 block text-[10px]">ATENDIDAS</span>
              <span className="text-lg font-bold text-emerald-800">{resultadoAuditoria.atendidosObrigatorios}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 font-mono">
              <span className="text-rose-700 block text-[10px]">PENDÊNCIAS</span>
              <span className="text-lg font-bold text-rose-800">{resultadoAuditoria.pendentesObrigatorios.length}</span>
            </div>
          </div>

          {/* PENDÊNCIAS */}
          {resultadoAuditoria.pendentesObrigatorios.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                Documentos Obrigatórios Não Identificados:
              </h5>
              <ul className="list-disc list-inside text-xs text-rose-800 space-y-1 font-medium">
                {resultadoAuditoria.pendentesObrigatorios.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* RESSALVAS */}
          {resultadoAuditoria.ressalvasIdentificadas.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
              <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Diretrizes e Regras Especiais da SEDUR:
              </h5>
              <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5">
                {resultadoAuditoria.ressalvasIdentificadas.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ENQUADRAMENTO LEGAL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Enquadramento Legal e Conclusão Técnica Sugerida:
            </label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-mono space-y-2">
              <p><strong>Fundamentação:</strong> {resultadoAuditoria.fundamentacaoLegal}</p>
              <p><strong>Parecer:</strong> {resultadoAuditoria.resumoParecer}</p>
            </div>
          </div>

          {/* AÇÕES */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCopiarTextoAuditoria}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiado ? 'Relatório Copiado!' : 'Copiar Relatório de Análise'}
            </button>

            <div className="flex items-center gap-2">
              {onAplicarChecklist && (
                <button
                  type="button"
                  onClick={() => {
                    const atendidos = anexos.filter(a => a.itemChecklistId).map(a => a.itemChecklistId as string);
                    onAplicarChecklist(atendidos);
                    alert(`${atendidos.length} itens foram marcados automaticamente no checklist do formulário.`);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Marcar no Formulário
                </button>
              )}

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
