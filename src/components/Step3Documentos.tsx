// src/components/Step3Documentos.tsx
import React, { useMemo, useState, useRef } from 'react';
import { 
  FileCheck, 
  CheckSquare, 
  Square, 
  CheckCheck, 
  RotateCcw, 
  Sparkles,
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Scale,
  ShieldCheck,
  XCircle,
  Copy,
  Check,
  Tag,
  ListChecks
} from 'lucide-react';
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

interface AnexoAnalise {
  id: string;
  arquivoNome: string;
  tamanho: number;
  tipoMime: string;
  docCorrespondente?: DocumentoBaseItem;
  status: 'CONFORME' | 'RESSALVA' | 'NAO_IDENTIFICADO';
  observacao: string;
}

export const Step3Documentos: React.FC<Step3Props> = ({ formData, setFormData }) => {
  const tipologia = formData.tipologia_atividade || 'GERAL';
  const modalidade = formData.modalidade;
  const isRenovacao = modalidade === 'RENOVACAO_LAS';
  const isInexigibilidade = modalidade === 'INEXIGIBILIDADE';

  // Controle de abas internas do Passo 3
  const [abaAtiva, setAbaAtiva] = useState<'ANEXOS' | 'CHECKLIST'>('ANEXOS');
  
  // Estado de arquivos anexados para análise
  const [anexos, setAnexos] = useState<AnexoAnalise[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Filtra os documentos que se aplicam ao ato e à tipologia
  const docsAplicaveis = useMemo(() => {
    return DOCUMENTOS_BASE_CAMACARI.filter((doc: DocumentoBaseItem) => {
      if (doc.somenteRenovacao && !isRenovacao) return false;
      if (isInexigibilidade && doc.dispensadoEmInexigibilidade) return false;
      if (doc.somenteTipologias && !doc.somenteTipologias.includes(tipologia)) return false;
      return true;
    });
  }, [tipologia, modalidade, isRenovacao, isInexigibilidade]);

  // 2. Documentos obrigatórios (Coluna C = "x" na planilha oficial da SEDUR)
  const docsObrigatorios = useMemo(() => {
    return docsAplicaveis.filter(d => verificarDocumentoObrigatorioSedur(d, modalidade, tipologia));
  }, [docsAplicaveis, modalidade, tipologia]);

  const obrigatoriosConferidos = useMemo(() => {
    return docsObrigatorios.filter(d => formData.documentos_conferidos.includes(d.id));
  }, [docsObrigatorios, formData.documentos_conferidos]);

  // =========================================================================
  // MOTOR DE CLASSIFICAÇÃO E AUDITORIA BASEADO NA LEGISLAÇÃO DE CAMAÇARI
  // =========================================================================
  const classificarArquivoPeloNome = (nomeArquivo: string): {
    docCorrespondente?: DocumentoBaseItem;
    status: 'CONFORME' | 'RESSALVA' | 'NAO_IDENTIFICADO';
    observacao: string;
  } => {
    const nomeLimpo = nomeArquivo.toLowerCase();

    // Regra Especial da CLA/SEDUR: AVCB dos Bombeiros NÃO é obrigatório no licenciamento ambiental
    if (/bombeiros|avcb|clcb|panico/i.test(nomeLimpo)) {
      const docAvcb = docsAplicaveis.find(d => /bombeiro|avcb/i.test(d.nome));
      return {
        docCorrespondente: docAvcb,
        status: 'CONFORME',
        observacao: 'Documento informativo anexado. Conforme diretriz da CLA/SEDUR Camaçari, o AVCB NÃO é obrigatório para licenças ambientais ordinárias.',
      };
    }

    // Identificação de Matrícula ou Contrato de Locação (Flexibilidade dominial aceita na SEDUR)
    if (/matricula|rgi|onus|escritura|registro.*imovel/i.test(nomeLimpo)) {
      const docMatricula = docsAplicaveis.find(d => /matr[íi]cula|rgi/i.test(d.nome));
      return {
        docCorrespondente: docMatricula,
        status: 'CONFORME',
        observacao: 'Certidão de Matrícula imobiliária identificada (recomenda-se emissão com até 90 dias).',
      };
    }

    if (/contrato.*loca[çc][ãa]o|aluguel|arrendamento|cessao/i.test(nomeLimpo)) {
      const docLocacao = docsAplicaveis.find(d => /loca[çc][ãa]o|matr[íi]cula|propriedade/i.test(d.nome));
      return {
        docCorrespondente: docLocacao,
        status: 'RESSALVA',
        observacao: 'Comprovação dominial via Contrato de Locação: Certificar firmas reconhecidas das partes e legitimidade do locador.',
      };
    }

    // Concessionária de Água / Esgotamento (EMBASA ou Fossa Séptica)
    if (/embasa|esgoto|concessionaria.*agua|fossa|sumidouro/i.test(nomeLimpo)) {
      const docEsgoto = docsAplicaveis.find(d => /embasa|esgoto|fossa/i.test(d.nome));
      return {
        docCorrespondente: docEsgoto,
        status: 'CONFORME',
        observacao: 'Comprovação de saneamento: Rede pública da EMBASA ou Anotação de Responsabilidade Técnica de Fossa Séptica.',
      };
    }

    // Busca direta na lista de documentos aplicáveis por palavras-chave
    for (const doc of docsAplicaveis) {
      const termosDoc = doc.nome.toLowerCase().split(/\s+/).filter(t => t.length > 3);
      const match = termosDoc.filter(termo => nomeLimpo.includes(termo));
      if (match.length >= 2) {
        return {
          docCorrespondente: doc,
          status: 'CONFORME',
          observacao: `Identificado e vinculado ao Item ${doc.itemSedur} da Matriz SEDUR Camaçari.`,
        };
      }
    }

    return {
      status: 'NAO_IDENTIFICADO',
      observacao: 'Documento não identificado automaticamente. Verifique se corresponde a algum item do checklist manual.',
    };
  };

  // Processamento do upload / drag & drop de arquivos
  const handleProcessarArquivos = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const novosAnexos: AnexoAnalise[] = Array.from(files).map(file => {
      const resultado = classificarArquivoPeloNome(file.name);
      return {
        id: `anexo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        arquivoNome: file.name,
        tamanho: file.size,
        tipoMime: file.type || 'application/octet-stream',
        docCorrespondente: resultado.docCorrespondente,
        status: resultado.status,
        observacao: resultado.observacao,
      };
    });

    const listaAtualizada = [...anexos, ...novosAnexos];
    setAnexos(listaAtualizada);

    // Auto-marcação no formulário dos itens reconhecidos
    const idsReconhecidos = listaAtualizada
      .map(a => a.docCorrespondente?.id)
      .filter((id): id is number => typeof id === 'number');

    if (idsReconhecidos.length > 0) {
      setFormData(prev => {
        const uniao = Array.from(new Set([...prev.documentos_conferidos, ...idsReconhecidos]));
        return { ...prev, documentos_conferidos: uniao };
      });
    }
  };

  const handleRemoverAnexo = (id: string) => {
    setAnexos(prev => prev.filter(a => a.id !== id));
  };

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

  // =========================================================================
  // CÁLCULOS DE CONFORMIDADE E AUDITORIA DA SEDUR
  // =========================================================================
  const percentualConcluido = docsAplicaveis.length > 0
    ? Math.round((formData.documentos_conferidos.length / docsAplicaveis.length) * 100)
    : 0;

  const instrucaoCompleta = docsObrigatorios.length > 0 && obrigatoriosConferidos.length === docsObrigatorios.length;

  const docsObrigatoriosFaltantes = useMemo(() => {
    return docsObrigatorios.filter(d => !formData.documentos_conferidos.includes(d.id));
  }, [docsObrigatorios, formData.documentos_conferidos]);

  // Fundamentação legal padrão de Camaçari
  const fundamentacaoLegal = useMemo(() => {
    if (modalidade === 'DISPENSA' || modalidade === 'INEXIGIBILIDADE') {
      return 'Art. 53, § 2º e Anexo IV da Lei Complementar nº 1.876/2023 c/c Resolução CEPRAM nº 4.579/2018 e Decreto Estadual nº 14.024/2012.';
    }
    if (isRenovacao) {
      return 'Art. 51 c/c Art. 60 da Lei Complementar nº 1.876/2023 (Código Ambiental de Camaçari).';
    }
    return 'Art. 51 e Anexo II da Lei Complementar nº 1.876/2023 e diretrizes de zoneamento da LC nº 1.873/2023 (PDDU Camaçari).';
  }, [modalidade, isRenovacao]);

  // Texto formatado para copiar ou transportar para o parecer
  const handleCopiarRelatorioAuditoria = () => {
    const texto = `RELATÓRIO DE AUDITORIA DOCUMENTAL - SEDUR CAMAÇARI (ASTEC)
Modalidade: ${modalidade} | Tipologia: ${tipologia} | Destino: ${formData.destinatario || 'CLA'}
Data da Análise: ${new Date().toLocaleDateString('pt-BR')}

1. DIAGNÓSTICO DE INSTRUÇÃO PROCESSUAL:
- Total de documentos aplicáveis analisados: ${docsAplicaveis.length}
- Documentos obrigatórios (com "x" na Coluna C da SEDUR): ${docsObrigatorios.length}
- Documentos obrigatórios conferidos/anexados: ${obrigatoriosConferidos.length}
- Pendências de documentos obrigatórios: ${docsObrigatoriosFaltantes.length}

2. DOCUMENTOS OBRIGATÓRIOS PENDENTES (PARA DILIGÊNCIA / NOTIFICAÇÃO SIS-SEDUR):
${docsObrigatoriosFaltantes.map((d, i) => `  ${i + 1}. Item ${d.itemSedur} -${d.nome}`).join('\n') || '  - Nenhuma pendência identificada. Instrução documental 100% regular.'}

3. DIRETRIZES ESPECÍFICAS DA SEDUR CAMAÇARI APLICADAS:
- AVCB (Corpo de Bombeiros): Conforme diretriz da CLA/SEDUR, o AVCB não é condicionante obrigatória para licenciamento ambiental ordinário.
- Dominialidade: Aceita-se Certidão de Matrícula do RGI atualizada ou Contrato de Locação/Cessão de Posse com firmas reconhecidas.
- Esgotamento Sanitário: Declaração da EMBASA ou ART/RRT de sistema individual (fossa séptica + sumidouro).

4. BASE LEGAL MUNICIPAL:
${fundamentacaoLegal}

5. ENCAMINHAMENTO TÉCNICO SUGERIDO:
${instrucaoCompleta 
  ? `Opina-se pelo DEFERIMENTO do pleito de ${modalidade}, com restituição dos autos ao setor competente (${formData.destinatario || 'CLA'}).`
  : `Opina-se pela NOTIFICAÇÃO DO INTERESSADO (Diligência via SIS-SEDUR) no prazo regulamentar para apresentação dos documentos pendentes.`
}`;

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Etapa 3 */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-slate-700" />
            Etapa 3: Checklist & Análise Documental (SEDUR Camaçari)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Conferência oficial para <strong>{
              modalidade === 'INEXIGIBILIDADE' ? 'Inexigibilidade de Licenciamento' :
              tipologia === 'POSTO_COMBUSTIVEL' ? 'Posto de Combustíveis (LAS)' :
              tipologia === 'MINERACAO' ? 'Mineração (LAS)' :
              tipologia === 'URBANISTICO' ? 'Empreendimentos Urbanísticos (LAS)' :
              tipologia === 'OBRA' ? 'Obras / Construção Civil (LAS)' :
              tipologia === 'ERB' ? 'Estação Rádio Base (ERB)' : 'Licenciamento Geral'
            }</strong>.
          </p>
        </div>

        {/* Alternador de Abas: Análise de Anexos vs Checklist Manual */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setAbaAtiva('ANEXOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              abaAtiva === 'ANEXOS'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-blue-600" />
            Análise por Anexos {anexos.length > 0 && `(${anexos.length})`}
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('CHECKLIST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              abaAtiva === 'CHECKLIST'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListChecks className="w-4 h-4 text-slate-600" />
            Checklist Manual (Coluna C)
          </button>
        </div>
      </div>

      {/* Card da Barra de Progresso e Instrução Geral */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Instrução Processual: {percentualConcluido}% ({formData.documentos_conferidos.length} de {docsAplicaveis.length} conferidos)
            {formData.documentos_conferidos.length > 0 && (
              <span className="text-[11px] font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-identificados / Conferidos
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
              : `Faltam ${docsObrigatoriosFaltantes.length} documento(s) com "x" na SEDUR`}
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
          <div className="flex flex-wrap items-center gap-2">
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
              onClick={handleCopiarRelatorioAuditoria}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copiado ? 'Relatório Copiado!' : 'Copiar Diagnóstico Técnico'}
            </button>
          </div>

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

      {/* ========================================================================= */}
      {/* ABA 1: ANÁLISE AUTOMÁTICA POR ANEXOS (DROPZONE E AUDITORIA DE DOCUMENTOS) */}
      {/* ========================================================================= */}
      {abaAtiva === 'ANEXOS' && (
        <div className="space-y-6">
          {/* Caixa de Upload / Drag & Drop */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              handleProcessarArquivos(e.dataTransfer.files);
            }}
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
              onChange={e => handleProcessarArquivos(e.target.files)}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-blue-600 mx-auto mb-2.5 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800">
              Anexe aqui os documentos do processo para análise automática da SEDUR
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
              Arraste e solte ou clique para selecionar os arquivos (PDFs, imagens de certidões, contratos, projetos e requerimentos do SIS-SEDUR). O sistema fará a correspondência imediata com a Matriz Oficial.
            </p>
          </div>

          {/* Lista de Documentos Anexados e Triados */}
          {anexos.length > 0 && (
            <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Arquivos Anexados ({anexos.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setAnexos([])}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Limpar Lista de Anexos
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {anexos.map(anexo => (
                  <div
                    key={anexo.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-800 truncate" title={anexo.arquivoNome}>
                          {anexo.arquivoNome}
                        </span>
                      </div>

                      {anexo.docCorrespondente ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Item {anexo.docCorrespondente.itemSedur}
                          </span>
                          <span className="text-[11px] text-slate-700 font-medium">
                            {anexo.docCorrespondente.nome}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          Documento Complementar Geral
                        </span>
                      )}

                      <p className="text-[10px] text-slate-500 italic">
                        {anexo.observacao}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoverAnexo(anexo.id)}
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

          {/* Painel de Auditoria de Conformidade SEDUR */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Diagnóstico Técnico Especializado
                </span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  Auditoria de Conformidade Legal — SEDUR Camaçari
                </h3>
              </div>

              <div>
                {instrucaoCompleta ? (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    APTO PARA DEFERIMENTO ({formData.destinatario || 'CLA'})
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    PENDÊNCIAS IDENTIFICADAS (DILIGÊNCIA)
                  </span>
                )}
              </div>
            </div>

            {/* Métricas do Diagnóstico */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                <span className="text-slate-500 block text-[10px]">ANEXOS PROCESSADOS</span>
                <span className="text-lg font-bold text-slate-800">{anexos.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                <span className="text-slate-500 block text-[10px]">OBRIGATÓRIOS (COLUNA C)</span>
                <span className="text-lg font-bold text-slate-800">{docsObrigatorios.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-mono">
                <span className="text-emerald-700 block text-[10px]">CONFERIDOS</span>
                <span className="text-lg font-bold text-emerald-800">{obrigatoriosConferidos.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 font-mono">
                <span className="text-rose-700 block text-[10px]">FALTANTES</span>
                <span className="text-lg font-bold text-rose-800">{docsObrigatoriosFaltantes.length}</span>
              </div>
            </div>

            {/* Alerta de Documentos Faltantes */}
            {docsObrigatoriosFaltantes.length > 0 && (
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Documentos Obrigatórios Pendentes (Irão para a Notificação/Diligência):
                </h5>
                <ul className="list-disc list-inside text-xs text-rose-800 space-y-1 font-medium">
                  {docsObrigatoriosFaltantes.map(doc => (
                    <li key={doc.id}>
                      Item {doc.itemSedur} - {doc.nome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Diretrizes Consolidadas da SEDUR */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
              <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Diretrizes Especiais de Análise da SEDUR Camaçari:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <strong>AVCB (Bombeiros):</strong> Conforme diretriz da CLA/SEDUR, o AVCB <u>NÃO</u> é obrigatório para a emissão de licenças ambientais ordinárias.
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <strong>Dominialidade:</strong> A Matrícula do RGI pode ser suprida por Contrato de Locação ou Cessão de Posse com firmas reconhecidas.
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <strong>Esgotamento Sanitário:</strong> Declaração de viabilidade da EMBASA ou ART/RRT de fossa séptica e sumidouro.
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <strong>Enquadramento Legal:</strong> {fundamentacaoLegal}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: CHECKLIST MANUAL DE DOCUMENTOS (COLUNA C DA SEDUR)                 */}
      {/* ========================================================================= */}
      {abaAtiva === 'CHECKLIST' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Clique nos itens para marcar ou desmarcar a conferência manual:
            </span>
            <span className="text-xs text-slate-700 font-bold">
              {docsAplicaveis.length} itens aplicáveis encontrados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {docsAplicaveis.map((doc: DocumentoBaseItem) => {
              const checked = formData.documentos_conferidos.includes(doc.id);
              const obrigatorio = verificarDocumentoObrigatorioSedur(doc, modalidade, tipologia);

              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                    checked
                      ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <button type="button" className="mt-0.5 text-emerald-600 flex-shrink-0">
                    {checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                  </button>
                  <div className="text-xs leading-relaxed flex-1">
                    <span className="font-bold mr-1 text-slate-800">Item {doc.itemSedur}</span>
                    <span> - {doc.nome}</span>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {obrigatorio ? (
                        <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                          Obrigatório (x)
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Se couber
                        </span>
                      )}
                      {doc.somenteTipologias && (
                        <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                          Específico da Tipologia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
