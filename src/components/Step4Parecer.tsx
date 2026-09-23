// src/components/Step4Parecer.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Copy, 
  Save, 
  RotateCcw, 
  Check, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  FileSearch,
  SendHorizontal
} from 'lucide-react';
import { ProcessoFormData, StatusParecer, DestinatarioParecer } from '../types';
import { 
  DOCUMENTOS_BASE_CAMACARI, 
  DocumentoBaseItem,
  verificarDocumentoObrigatorioSedur 
} from '../data/normativasCamacari';
import { salvarProcessoNoMysql } from '../services/api';

interface Step4Props {
  formData: ProcessoFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProcessoFormData>>;
  onLimparFormulario: () => void;
}

export const Step4Parecer: React.FC<Step4Props> = ({ 
  formData, 
  setFormData, 
  onLimparFormulario 
}) => {
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucessoSalvar, setSucessoSalvar] = useState<string | null>(null);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  const tipologia = formData.tipologia_atividade || 'GERAL';
  const modalidade = formData.modalidade;
  const isRenovacao = modalidade === 'RENOVACAO_LAS';
  const isInexigibilidade = modalidade === 'INEXIGIBILIDADE';

  // Identifica documentos obrigatórios da SEDUR (coluna C = "x") que não foram conferidos
  const documentosFaltantes = useMemo(() => {
    const aplicaveis = DOCUMENTOS_BASE_CAMACARI.filter((doc: DocumentoBaseItem) => {
      if (doc.somenteRenovacao && !isRenovacao) return false;
      if (isInexigibilidade && doc.dispensadoEmInexigibilidade) return false;
      if (doc.somenteTipologias && !doc.somenteTipologias.includes(tipologia)) return false;
      return verificarDocumentoObrigatorioSedur(doc, modalidade, tipologia);
    });

    return aplicaveis.filter((doc: DocumentoBaseItem) => !formData.documentos_conferidos.includes(doc.id));
  }, [formData.modalidade, formData.tipologia_atividade, formData.documentos_conferidos, tipologia, isRenovacao, isInexigibilidade, modalidade]);

  const temPendenciaDocumental = documentosFaltantes.length > 0;

  const setorSugeridoInicial: DestinatarioParecer = useMemo(() => {
    if (formData.modalidade === 'RENOVACAO_LAS') return 'GABINETE';
    if (formData.modalidade === 'DISPENSA') return 'CLA';
    return formData.destinatario_parecer || 'CLA';
  }, [formData.modalidade, formData.destinatario_parecer]);

  const construirTextoParecer = (
    destinatarioAlvo: DestinatarioParecer,
    statusAlvo: StatusParecer
  ): string => {
    const nomeEmpresa = formData.interessado ? formData.interessado.trim() : '[NOME DO INTERESSADO]';
    const cnpjEmpresa = formData.cnpj ? formData.cnpj.trim() : '[CNPJ]';
    const numeroProcesso = formData.numero_processo ? formData.numero_processo.trim() : '[Nº PROCESSO]';

    const localizacaoCompleta = [
      formData.endereco?.trim(),
      formData.bairro?.trim(),
      'Camaçari/BA'
    ].filter(Boolean).join(', ') || '[ENDEREÇO COMPLETO]';

    const coordenadasFormatadas = formData.coordenadas?.trim() || 'conforme RCE';
    const zoneamentoFormatado = formData.zona_urbanistica || 'Zona Urbana';

    const modalidadeTexto =
      formData.modalidade === 'RENOVACAO_LAS'
        ? 'RENOVAÇÃO DE LICENÇA AMBIENTAL SIMPLIFICADA (RLAS)'
        : formData.modalidade === 'DISPENSA'
        ? 'DISPENSA DE LICENCIAMENTO AMBIENTAL (DLA)'
        : formData.modalidade === 'INEXIGIBILIDADE'
        ? 'DECLARAÇÃO DE INEXIGIBILIDADE'
        : 'LICENÇA AMBIENTAL SIMPLIFICADA (LAS)';

    let atividadeDescricao = 'atividades econômicas constantes no requerimento';
    if (formData.cnae_principal?.descricao) {
      const secundarias = formData.cnaes_secundarios?.length 
        ? ` (${formData.cnaes_secundarios.map(c => c.descricao).slice(0, 2).join(', ')})`
        : '';
      atividadeDescricao = `${formData.cnae_principal.descricao}${secundarias}`;
    }

    let vocativo = 'À CLA,';
    let fecho = 'RESTITUAM-SE OS AUTOS À CLA para emissão do ato e prosseguimento.';

    if (destinatarioAlvo === 'GABINETE') {
      vocativo = 'AO GABINETE,';
      fecho = statusAlvo === 'DILIGENCIA'
        ? 'ENCAMINHEM-SE OS AUTOS AO GABINETE para conhecimento e notificação do interessado.'
        : 'ENCAMINHEM-SE OS AUTOS AO GABINETE para deliberação, emissão do ato e prosseguimento.';
    } else if (destinatarioAlvo === 'CLU') {
      vocativo = 'À CLU,';
      fecho = statusAlvo === 'DILIGENCIA'
        ? 'RESTITUAM-SE OS AUTOS À CLU para notificação do interessado e prosseguimento.'
        : 'RESTITUAM-SE OS AUTOS À CLU para as providências cabíveis e prosseguimento.';
    }

    if (statusAlvo === 'DILIGENCIA' || temPendenciaDocumental) {
      const listaPendencias = documentosFaltantes.length > 0
        ? documentosFaltantes.map((d, i) => `   ${i + 1}. [Item ${d.itemSedur}] ${d.nome}`).join('\n')
        : '   1. Esclarecimento técnico acerca da dinâmica operacional no imóvel.';

      return `INTERESSADO: ${nomeEmpresa}
PROCESSO: ADMINISTRATIVO Nº: ${numeroProcesso}
CNPJ: ${cnpjEmpresa}
ENDEREÇO: ${localizacaoCompleta}
ASSUNTO: ${modalidadeTexto}

${vocativo}

Trata-se de requerimento de ${modalidadeTexto}, formulado por ${nomeEmpresa}, inscrito no CNPJ sob o nº ${cnpjEmpresa}, estabelecimento localizado na ${localizacaoCompleta}, coordenadas ${coordenadasFormatadas}, inserido na ${zoneamentoFormatado}.

Da análise preliminar das informações constantes dos autos eletrônicos e do Relatório de Caracterização do Empreendimento (RCE), constata-se a AUSÊNCIA de elementos e documentos obrigatórios indispensáveis ao prosseguimento da análise meritória, restando pendente a juntada dos seguintes itens:

${listaPendencias}

Ante o exposto, esta Assessoria Técnica (ASTEC) manifesta-se pela BAIXA DOS AUTOS EM DILIGÊNCIA para notificação do interessado no prazo regulamentar de 30 (trinta) dias para cumprimento integral das pendências sobreditas.

${fecho}`;
    }

    let paragrafoDinamica = `Da análise das informações constantes do requerimento e no Relatório de Caracterização do Empreendimento (RCE), verifica-se que a dinâmica operacional no imóvel consiste precipuamente em ${atividadeDescricao}, montagem sob demanda e em pequena escala, sem estoque de matéria-prima ou subprodutos e sem geração de efluentes industriais.`;

    if (formData.modalidade === 'RENOVACAO_LAS') {
      paragrafoDinamica = `Da análise das informações constantes do requerimento e no Relatório de Caracterização do Empreendimento (RCE), verifica-se que o pleito refere-se à renovação da licença ambiental anteriormente outorgada (${formData.numeroLicencaAnterior || 'conforme licença anterior acostada aos autos'}), tendo o requerente apresentado o relatório de atendimento às condicionantes técnicas exigidas e declarado a inexistência de alteração ou ampliação de porte no estabelecimento.`;
    }

    return `INTERESSADO: ${nomeEmpresa}
PROCESSO: ADMINISTRATIVO Nº: ${numeroProcesso}
CNPJ: ${cnpjEmpresa}
ENDEREÇO: ${localizacaoCompleta}
ASSUNTO: ${modalidadeTexto}

${vocativo}

Trata-se de requerimento de ${modalidadeTexto}, para a atividade de ${atividadeDescricao}, formulado por ${nomeEmpresa}, inscrito no CNPJ sob o nº ${cnpjEmpresa}, estabelecimento localizado na ${localizacaoCompleta}, coordenadas ${coordenadasFormatadas}, inserido na ${zoneamentoFormatado}.

${paragrafoDinamica}

Assim, constata-se que a operação apresenta porte e potencial poluidor classificados abaixo dos limites exigidos para licenciamento ordinário ou simplificado (LAS), autorizando a emissão da ${modalidadeTexto}, nos termos do art. 53, § 2º, e Anexo IV da Lei Complementar Municipal nº 1.876/2023, c/c a Resolução CEPRAM nº 4.579/2018 e o Decreto Estadual nº 14.024/2012.

Ante o exposto, esta Assessoria Técnica (ASTEC) opina pelo DEFERIMENTO da ${modalidadeTexto} especificamente para as atividades de ${atividadeDescricao}.

${fecho}`;
  };

  const sincronizarTexto = (
    destinatario: DestinatarioParecer = formData.destinatario_parecer || setorSugeridoInicial,
    status: StatusParecer = formData.status_parecer
  ) => {
    const textoAtualizado = construirTextoParecer(destinatario, status);
    setFormData(prev => ({
      ...prev,
      destinatario_parecer: destinatario,
      status_parecer: status,
      texto_parecer: textoAtualizado,
    }));
  };

  useEffect(() => {
    sincronizarTexto();
  }, [
    formData.numero_processo,
    formData.cnpj,
    formData.interessado,
    formData.endereco,
    formData.bairro,
    formData.modalidade,
    formData.tipologia_atividade
  ]);

  const handleCopiarClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formData.texto_parecer);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      alert('Não foi possível copiar para a área de transferência.');
    }
  };

  const handleSalvar = async () => {
    setSalvando(true);
    setSucessoSalvar(null);
    setErroSalvar(null);

    try {
      const res = await salvarProcessoNoMysql(formData);
      setSucessoSalvar(`${res.message} (Registro #${res.id})`);
      setFormData(prev => ({ ...prev, id: res.id }));
    } catch (err: any) {
      setErroSalvar(err.message || 'Falha ao salvar dados.');
    } finally {
      setSalvando(false);
    }
  };

  const handleMudarSetor = (novoSetor: DestinatarioParecer) => {
    sincronizarTexto(novoSetor, formData.status_parecer);
  };

  const handleMudarStatus = (novoStatus: StatusParecer) => {
    sincronizarTexto(formData.destinatario_parecer, novoStatus);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-700" />
            Etapa 4: Parecer Técnico da ASTEC
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Minuta formal da ASTEC fundamentada no Art. 53, § 2º da LC nº 1.876/2023.
          </p>
        </div>

        <button
          type="button"
          onClick={() => sincronizarTexto()}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition self-start md:self-center"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          Regenerar Minuta com Dados Atuais
        </button>
      </div>

      {/* Seletor do Setor Destinatário */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <SendHorizontal className="w-4 h-4 text-emerald-600" />
          Direcionamento do Parecer Técnico:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleMudarSetor('CLA')}
            className={`p-3 rounded-lg border-2 text-left transition ${
              formData.destinatario_parecer === 'CLA'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="text-sm">À CLA</div>
            <div className="text-[11px] font-normal text-slate-500">Coord. Licenciamento Ambiental (Padrão DLA)</div>
          </button>

          <button
            type="button"
            onClick={() => handleMudarSetor('GABINETE')}
            className={`p-3 rounded-lg border-2 text-left transition ${
              formData.destinatario_parecer === 'GABINETE'
                ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="text-sm">Ao Gabinete</div>
            <div className="text-[11px] font-normal text-slate-500">Gabinete SEDUR (Renovação de LAS / Portarias)</div>
          </button>

          <button
            type="button"
            onClick={() => handleMudarSetor('CLU')}
            className={`p-3 rounded-lg border-2 text-left transition ${
              formData.destinatario_parecer === 'CLU'
                ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="text-sm">À CLU</div>
            <div className="text-[11px] font-normal text-slate-500">Coord. Licenciamento Urbanístico</div>
          </button>
        </div>
      </div>

      {/* Alerta de Documentação Faltante */}
      {temPendenciaDocumental ? (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              Atenção: Há {documentosFaltantes.length} documento(s) com "x" na relação da SEDUR não conferido(s)
            </h3>
            <p className="text-xs text-amber-800 mt-1">
              Para processos com pendência na lista da CLA, a conclusão técnica é a <strong>Baixa em Diligência</strong>.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleMudarStatus('DILIGENCIA')}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                  formData.status_parecer === 'DILIGENCIA'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
              >
                Concluir por Diligência
              </button>
              <button
                type="button"
                onClick={() => handleMudarStatus('DEFERIMENTO')}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                  formData.status_parecer === 'DEFERIMENTO'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Manter Deferimento
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Todos os documentos obrigatórios da SEDUR (coluna C) foram conferidos. Processo apto para Deferimento.
          </span>
          <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[11px]">
            Instrução 100%
          </span>
        </div>
      )}

      {sucessoSalvar && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{sucessoSalvar}</span>
        </div>
      )}

      {erroSalvar && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg">
          {erroSalvar}
        </div>
      )}

      {/* Textarea do Parecer Oficial */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-slate-500" />
            Texto do Parecer Técnico (Editável):
          </label>
          <span className="text-xs text-slate-500 font-medium">
            Direcionado: <strong>{
              formData.destinatario_parecer === 'GABINETE' ? 'Ao Gabinete' :
              formData.destinatario_parecer === 'CLU' ? 'À CLU' : 'À CLA'
            }</strong>
          </span>
        </div>
        <textarea
          rows={17}
          value={formData.texto_parecer}
          onChange={e => setFormData(p => ({ ...p, texto_parecer: e.target.value }))}
          className="w-full p-4 border border-slate-300 rounded-xl font-mono text-xs leading-relaxed text-slate-900 bg-white focus:ring-2 focus:ring-slate-600 focus:border-slate-600 shadow-inner"
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onLimparFormulario}
          className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-2 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Limpar / Novo Processo
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCopiarClipboard}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiado ? 'Copiado com Sucesso!' : 'Copiar para o SIS-SEDUR'}
          </button>

          <button
            type="button"
            onClick={handleSalvar}
            disabled={salvando}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {salvando ? 'Gravando...' : 'Salvar no Banco'}
          </button>
        </div>
      </div>
    </div>
  );
};
