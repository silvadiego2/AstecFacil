import React, { useEffect, useState } from 'react';
import { Copy, Save, RotateCcw, Check, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { ProcessoFormData } from '../types';
import { FUNDAMENTACAO_LEGAL } from '../data/normativasCamacari';
import { salvarProcessoNoMysql } from '../services/api';

interface Step4Props {
  formData: ProcessoFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProcessoFormData>>;
  onLimparFormulario: () => void;
}

export const Step4Parecer: React.FC<Step4Props> = ({ formData, setFormData, onLimparFormulario }) => {
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucessoSalvar, setSucessoSalvar] = useState<string | null>(null);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  // Gerador automático do texto formal do Parecer
  const gerarParecerAutomatico = () => {
    const dataExtenso = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    const cnaePrinc = formData.cnae_principal?.descricao
      ? `${formData.cnae_principal.codigo} - ${formData.cnae_principal.descricao}`
      : 'Não informado';

    const modalidadeTexto =
      formData.modalidade === 'DISPENSA'
        ? 'DISPENSA DE LICENÇA AMBIENTAL (DLA)'
        : formData.modalidade === 'INEXIGIBILIDADE'
        ? 'DECLARAÇÃO DE INEXIGIBILIDADE DE LICENCIAMENTO AMBIENTAL'
        : 'LICENÇA AMBIENTAL SIMPLIFICADA (LAS)';

    const ressalvaIndustrial = formData.possui_atividade_industrial
      ? `\nRessalta-se que, em consonância com as informações prestadas no Relatório de Caracterização do Empreendimento (RCE), a atividade que ensejou enquadramento em CNAE fabril restringe-se estritamente à montagem artesanal/sob demanda em bancada interna, sem queima de combustíveis, sem geração de efluentes líquidos industriais e sem emissões atmosféricas significativas, inexistindo atividade de transformação pesada no imóvel sob análise.`
      : '';

    const texto = `PREFEITURA MUNICIPAL DE CAMAÇARI
SECRETARIA DO DESENVOLVIMENTO URBANO E MEIO AMBIENTE - SEDUR
ASSESSORIA TÉCNICA - ASTEC
PARECER TÉCNICO-JURÍDICO AMBIENTAL Nº ASTEC/${formData.numero_processo || 'PROCESSO'}/2026

À DIRETORIA DE MEIO AMBIENTE - DIRAM
Assunto: Análise de Enquadramento e Regularidade Ambiental
Processo Administrativo SIS-SEDUR: ${formData.numero_processo || '[NÃO INFORMADO]'}
Requerente / Interessado: ${formData.interessado || '[RAZÃO SOCIAL]'}
CNPJ: ${formData.cnpj || '[00.000.000/0000-00]'}
Localização: ${formData.endereco || '[ENDEREÇO]'}, ${formData.bairro || '[BAIRRO]'}, Camaçari - BA
Coordenadas Geográficas (SIRGAS 2000): ${formData.coordenadas || '[COORDENADAS]'}
Zoneamento Urbanístico: ${formData.zona_urbanistica || 'ZOUC 1'} (LC nº 1.873/2023 - PDDU)
Área Construída Ocupada: ${formData.area_m2 ? `${formData.area_m2} m²` : 'Conforme RCE'}
Atividade Principal: ${cnaePrinc}

1. RELATÓRIO E INSTRUÇÃO PROCESSUAL
Trata-se de requerimento administrativo protocolado perante esta SEDUR por meio do qual o interessado acima qualificado postula a emissão de ${modalidadeTexto} para a operação das atividades econômicas no endereço sobredito.

Compulsando os autos, constata-se a juntada de documentação indispensável à instrução técnica, destacando-se: requerimento padrão, comprovante de CNPJ ativo, contrato social registrado perante a JUCEB, certidão negativa municipal, comprovantes de infraestrutura básica (Coelba e Embasa), documento de posse/locação, arquivo georreferenciado e Relatório de Caracterização do Empreendimento (RCE).

2. DA FUNDAMENTAÇÃO LEGAL E ENQUADRAMENTO AMBIENTAL
A presente análise fundamenta-se nos termos da ${FUNDAMENTACAO_LEGAL.codigoMeioAmbiente}, da ${FUNDAMENTACAO_LEGAL.pddu}, da ${FUNDAMENTACAO_LEGAL.codigoUrbanistico}, bem como nas disposições gerais do ${FUNDAMENTACAO_LEGAL.decretoEstadual} e das ${FUNDAMENTACAO_LEGAL.cepram}.

À luz do Anexo IV da Lei Complementar Municipal nº 1.876/2023, o porte do empreendimento aliado à tipologia do seu processo operacional classificam-se como de impacto ambiental local insignificante/não significativo para a modalidade pretendida.${ressalvaIndustrial}

3. CONCLUSÃO E SALVAGUARDAS TÉCNICAS
Isto posto, esta ASTEC manifesta-se pelo DEFERIMENTO e VALIDAÇÃO do pedido de ${modalidadeTexto}, condicionada a sua eficácia ao estrito cumprimento das seguintes salvaguardas e condicionantes:

a) Fica expressamente VEDADA qualquer manipulação, estocagem a granel ou fracionamento de produtos químicos perigosos ou inflamáveis não autorizados previamente pelo órgão ambiental;
b) Proibição absoluta de implantação de lava-jato, ponto de abastecimento de combustíveis ou oficina mecânica no galpão sem o devido e prévio licenciamento ordinário;
c) Manutenção em vigor do Alvará de Localização e Funcionamento, do Alvará Sanitário emitido pela SESAU/VISA e da Licença do Corpo de Bombeiros Militar (AVCB/CLCB);
d) Correto acondicionamento e destinação ambientalmente adequada dos resíduos sólidos recicláveis e comuns gerados, consoante as diretrizes do Plano Municipal de Gestão Integrada de Resíduos Sólidos de Camaçari.

Encaminhem-se os autos à DIRAM para homologação final e lavratura do respectivo documento autorizativo.

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

  const handleSalvarNoMysql = async () => {
    setSalvando(true);
    setSucessoSalvar(null);
    setErroSalvar(null);

    try {
      const res = await salvarProcessoNoMysql(formData);
      setSucessoSalvar(`${res.message} (Registro nº ${res.id})`);
      setFormData(prev => ({ ...prev, id: res.id }));
    } catch (err: any) {
      setErroSalvar(err.message || 'Falha ao salvar no banco MySQL da HostGator.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-700" />
            Etapa 4: Parecer Técnico-Jurídico da ASTEC
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Minuta formal padronizada direcionada à DIRAM com enquadramento normativo completo de Camaçari.
          </p>
        </div>

        <button
          type="button"
          onClick={gerarParecerAutomatico}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition self-start md:self-center"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          Regenerar Parecer com Dados Atuais
        </button>
      </div>

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

      {/* Textarea Editável */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Texto do Parecer Técnico (Editável pelo Analista):
        </label>
        <textarea
          rows={16}
          value={formData.texto_parecer}
          onChange={e => setFormData(p => ({ ...p, texto_parecer: e.target.value }))}
          className="w-full p-4 border border-slate-300 rounded-xl font-mono text-xs leading-relaxed text-slate-900 bg-white focus:ring-2 focus:ring-slate-600 focus:border-slate-600 shadow-inner"
        />
        <span className="text-xs text-slate-400">
          Você pode revisar e alterar livremente a redação acima antes de salvar ou copiar para o sistema.
        </span>
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
            onClick={handleSalvarNoMysql}
            disabled={salvando}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {salvando ? 'Gravando...' : 'Salvar no MySQL da HostGator'}
          </button>
        </div>
      </div>
    </div>
  );
};
