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
  FileSearch
} from 'lucide-react';
import { ProcessoFormData, StatusParecer } from '../types';
import { FUNDAMENTACAO_LEGAL, DOCUMENTOS_BASE_CAMACARI, DocumentoBaseItem } from '../data/normativasCamacari';
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

  // Identifica quais documentos OBRIGATÓRIOS aplicáveis não foram conferidos
  const documentosFaltantes = useMemo(() => {
    const aplicaveis = DOCUMENTOS_BASE_CAMACARI.filter((doc: DocumentoBaseItem) => {
      if (doc.somenteRenovacao && formData.modalidade !== 'RENOVACAO_LAS') {
        return false;
      }
      return doc.obrigatorio;
    });

    return aplicaveis.filter((doc: DocumentoBaseItem) => !formData.documentos_conferidos.includes(doc.id));
  }, [formData.modalidade, formData.documentos_conferidos]);

  const temPendenciaDocumental = documentosFaltantes.length > 0;

  // Gerador dinâmico do Parecer da ASTEC
  const gerarParecerAutomatico = () => {
    const dataExtenso = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    const cnaePrinc = formData.cnae_principal?.descricao
      ? `${formData.cnae_principal.codigo} - ${formData.cnae_principal.descricao}`
      : 'Não informado no formulário';

    const modalidadeTexto =
      formData.modalidade === 'RENOVACAO_LAS'
        ? 'RENOVAÇÃO DE LICENÇA AMBIENTAL SIMPLIFICADA (RLAS)'
        : formData.modalidade === 'DISPENSA'
        ? 'DISPENSA DE LICENÇA AMBIENTAL (DLA)'
        : formData.modalidade === 'INEXIGIBILIDADE'
        ? 'DECLARAÇÃO DE INEXIGIBILIDADE DE LICENCIAMENTO AMBIENTAL'
        : 'LICENÇA AMBIENTAL SIMPLIFICADA (LAS)';

    // Dados interpolados do processo
    const nomeEmpresa = formData.interessado ? formData.interessado.trim() : '[NOME DA EMPRESA]';
    const cnpjEmpresa = formData.cnpj ? formData.cnpj.trim() : '[INSERIR CNPJ]';
    
    const localizacaoCompleta = [
      formData.endereco?.trim(),
      formData.bairro?.trim(),
      'Camaçari - BA'
    ].filter(Boolean).join(', ') || '[Localização]';

    const areaDeclarada = formData.area_m2 && formData.area_m2 > 0 
      ? `${formData.area_m2} m²` 
      : '[Área Construída Ocupada]';

    const zoneamentoFormatado = formData.zona_urbanistica 
      ? formData.zona_urbanistica 
      : '[Zoneamento Urbanístico]';

    // Frase complementar de renovação
    const complementoRenovacao = formData.modalidade === 'RENOVACAO_LAS'
      ? ` O pleito de RENOVAÇÃO da licença ambiental foi anteriormente concedida (${formData.numeroLicencaAnterior ? `Portaria/Licença nº ${formData.numeroLicencaAnterior}` : 'Portaria/Licença nº 138/2023'}), tendo o requerente apresentado o relatório de atendimento às condicionantes técnicas exigidas.`
      : '';

    // Ressalva de atividade fabril em bancada
    const ressalvaIndustrial = formData.possui_atividade_industrial
      ? `\nRessalta-se que, consoante declarações constantes no Relatório de Caracterização do Empreendimento (RCE), a atividade que ensejou o enquadramento em CNAE secundário fabril restringe-se à montagem artesanal/sob demanda em bancada interna, sem queima de combustíveis fósseis, sem geração de efluentes líquidos industriais e sem emissões atmosféricas poluentes significativas no galpão sob análise.`
      : '';

    // Redação da Seção 3 (Conclusão ou Diligência)
    let secaoConclusao = '';

    if (formData.status_parecer === 'DILIGENCIA' || temPendenciaDocumental) {
      const listaPendencias = documentosFaltantes.length > 0
        ? documentosFaltantes.map((d, i) => `   ${i + 1}. ${d.nome}`).join('\n')
        : '   1. Complementação de esclarecimentos técnicos sobre o processo operacional.';

      secaoConclusao = `3. CONCLUSÃO E PROPOSIÇÃO DE DILIGÊNCIA TÉCNICA
Da análise dos autos eletrônicos, constata-se a AUSÊNCIA de elementos obrigatórios indispensáveis à conclusão do mérito ambiental, restando pendente a juntada dos seguintes itens:
${listaPendencias}

Diante do exposto, esta Assessoria Técnica manifesta-se pela BAIXA DOS AUTOS EM DILIGÊNCIA, sugerindo a notificação do requerente via SIS-SEDUR para que, no prazo improrrogável de 30 (trinta) dias, promova a integral regularização da instrução documental, sob pena de indeferimento e arquivamento do feito.`;
    } else {
      secaoConclusao = `3. CONCLUSÃO E SALVAGUARDAS TÉCNICAS
Isto posto, devidamente instruído o feito e atendidos os preceitos normativos vigentes, esta Assessoria Técnica - ASTEC manifesta-se favorável ao DEFERIMENTO e VALIDAÇÃO do pedido de ${modalidadeTexto}, condicionada a sua plena eficácia à observância das seguintes condicionantes e salvaguardas:

a) Fica expressamente VEDADA qualquer manipulação, estocagem a granel ou fracionamento de produtos químicos perigosos ou inflamáveis não licenciados especificamente perante esta SEDUR;
b) Proibição absoluta de implantação de lava-jato de frotas, posto interno de abastecimento ou oficina mecânica pesada no galpão sem licenciamento ambiental autônomo;
c) Manutenção em plena vigência da Consulta de Viabilidade Urbanística / Alvará de Localização e Funcionamento, do Alvará Sanitário emitido pela SESAU/VISA e do Certificado de Licença do Corpo de Bombeiros Militar (AVCB/CLCB);
d) Correto acondicionamento e destinação ambientalmente adequada de todos os resíduos sólidos gerados, mantendo em arquivo comprobatório os Manifestos de Transporte de Resíduos (MTR/SINIR) e notas fiscais de destinação final licenciada.

Encaminhem-se os autos à DIRETORIA DE MEIO AMBIENTE - DIRAM para homologação final e expedição do respectivo ato autorizativo.`;
    }

    const texto = `PREFEITURA MUNICIPAL DE CAMAÇARI
SECRETARIA DO DESENVOLVIMENTO URBANO E MEIO AMBIENTE - SEDUR
ASSESSORIA TÉCNICA - ASTEC
PARECER TÉCNICO-JURÍDICO AMBIENTAL Nº ASTEC/${formData.numero_processo || 'PROCESSO'}/2026

À DIRETORIA DE MEIO AMBIENTE - DIRAM
Assunto: Análise de Enquadramento e Regularidade Ambiental
Processo Administrativo SIS-SEDUR: ${formData.numero_processo || '[NÃO INFORMADO]'}
Requerente / Interessado: ${nomeEmpresa}
CNPJ: ${cnpjEmpresa}
Localização: ${localizacaoCompleta}
Coordenadas Geográficas (SIRGAS 2000): ${formData.coordenadas || '[COORDENADAS]'}
Zoneamento Urbanístico: ${zoneamentoFormatado} (LC nº 1.873/2023 - PDDU)
Área Construída Ocupada: ${areaDeclarada}
Atividade Principal: ${cnaePrinc}

1. RELATÓRIO E INSTRUÇÃO PROCESSUAL
Trata-se de requerimento administrativo referente a solicitação de ${modalidadeTexto}, formulada por ${nomeEmpresa} (CNPJ: ${cnpjEmpresa}) para o empreendimento situado à ${localizacaoCompleta}, com área declarada de ${areaDeclarada}, inserido na ${zoneamentoFormatado}, para o exercício das atividades econômicas supracitada.${complementoRenovacao}

Compulsando os autos, procedeu-se ao exame da instrução documental obrigatória exigida pela legislação ambiental municipal e pelos atos regulamentares da SEDUR.

2. DA FUNDAMENTAÇÃO LEGAL E ENQUADRAMENTO AMBIENTAL
A presente manifestação técnica fundamenta-se nos termos da ${FUNDAMENTACAO_LEGAL.codigoMeioAmbiente}, da ${FUNDAMENTACAO_LEGAL.pddu}, da ${FUNDAMENTACAO_LEGAL.codigoUrbanistico}, bem como nas diretrizes gerais do ${FUNDAMENTACAO_LEGAL.decretoEstadual} e das ${FUNDAMENTACAO_LEGAL.cepram}.

À luz do Anexo IV e do Art. 14 da Lei Complementar Municipal nº 1.876/2023, o porte do empreendimento aliado à tipologia do seu processo operacional e a ausência de passivos ambientais conhecidos respaldam o enquadramento no rito administrativo de ${modalidadeTexto}.${ressalvaIndustrial}

${secaoConclusao}

Camaçari - BA, ${dataExtenso}.

___________________________________________________________
ASTEC - Assessoria Técnica Especializada em Meio Ambiente
SEDUR - Secretaria do Desenvolvimento Urbano e Meio Ambiente`;

    setFormData(prev => ({ ...prev, texto_parecer: texto }));
  };

  useEffect(() => {
    if (!formData.texto_parecer) {
      gerarParecerAutomatico();
    }
  }, []);

  const handleCopiarClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formData.texto_parecer);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      alert('Não foi possível copiar automaticamente para a área de transferência.');
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

  const handleMudarStatus = (novoStatus: StatusParecer) => {
    setFormData(prev => ({ ...prev, status_parecer: novoStatus }));
    setTimeout(() => gerarParecerAutomatico(), 50);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-700" />
            Etapa 4: Parecer Técnico-Jurídico da ASTEC
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Minuta formal padronizada direcionada à DIRAM, fundamentada nas leis municipais de Camaçari.
          </p>
        </div>

        <button
          type="button"
          onClick={gerarParecerAutomatico}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition self-start md:self-center"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          Regenerar Minuta com Dados Atuais
        </button>
      </div>

      {/* Alerta de Documentação Faltante / Recomendação */}
      {temPendenciaDocumental ? (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              Atenção: Há {documentosFaltantes.length} documento(s) obrigatório(s) não conferido(s)
            </h3>
            <p className="text-xs text-amber-800 mt-1">
              Para processos com pendência, a recomendação da ASTEC é a <strong>Baixa em Diligência</strong> para notificação no SIS-SEDUR.
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
            Todos os documentos obrigatórios foram conferidos. Processo apto para Deferimento.
          </span>
          <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[11px]">
            Instrução 100%
          </span>
        </div>
      )}

      {/* Mensagens de Sucesso ou Erro ao Salvar */}
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

      {/* Editor de Texto do Parecer */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-slate-500" />
            Texto do Parecer Técnico (Editável pelo Analista):
          </label>
          <span className="text-xs text-slate-400">Padrão Oficial ASTEC / DIRAM</span>
        </div>
        <textarea
          rows={17}
          value={formData.texto_parecer}
          onChange={e => setFormData(p => ({ ...p, texto_parecer: e.target.value }))}
          className="w-full p-4 border border-slate-300 rounded-xl font-mono text-xs leading-relaxed text-slate-900 bg-white focus:ring-2 focus:ring-slate-600 focus:border-slate-600 shadow-inner"
        />
        <span className="text-xs text-slate-400 block mt-1">
          Você pode revisar e ajustar a redação livremente antes de copiar para o SIS-SEDUR ou salvar.
        </span>
      </div>

      {/* Barra de Ações */}
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
