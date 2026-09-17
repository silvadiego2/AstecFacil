import React, { useMemo } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Layers, Cpu, Store } from 'lucide-react';
import { ProcessoFormData, ModalidadeLicenca } from '../types';
import { PALAVRAS_CHAVE_INDUSTRIA, FUNDAMENTACAO_LEGAL } from '../data/normativasCamacari';

interface Step2Props {
  formData: ProcessoFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProcessoFormData>>;
}

export const Step2Enquadramento: React.FC<Step2Props> = ({ formData, setFormData }) => {
  // Lista unificada de todos os CNAEs da empresa
  const todosCnaes = useMemo(() => {
    const lista = [];
    if (formData.cnae_principal?.descricao) {
      lista.push({ ...formData.cnae_principal, principal: true });
    }
    if (formData.cnaes_secundarios?.length) {
      formData.cnaes_secundarios.forEach(c => lista.push({ ...c, principal: false }));
    }
    return lista;
  }, [formData.cnae_principal, formData.cnaes_secundarios]);

  // Detector automático de CNAE fabril/industrial
  const cnaesIndustriais = useMemo(() => {
    return todosCnaes.filter(item => {
      const desc = item.descricao.toLowerCase();
      return PALAVRAS_CHAVE_INDUSTRIA.some(kw => desc.includes(kw));
    });
  }, [todosCnaes]);

  const temAtividadeFabril = cnaesIndustriais.length > 0;

  // Se todos forem comércio ou serviço de escritório
  const isApenasComercioSeco = useMemo(() => {
    if (todosCnaes.length === 0) return false;
    return todosCnaes.every(item => {
      const desc = item.descricao.toLowerCase();
      return (
        desc.includes('comércio') ||
        desc.includes('comercio') ||
        desc.includes('atacadista') ||
        desc.includes('varejista') ||
        desc.includes('serviço') ||
        desc.includes('escritório') ||
        desc.includes('consultoria') ||
        desc.includes('treinamento')
      ) && !PALAVRAS_CHAVE_INDUSTRIA.some(kw => desc.includes(kw));
    });
  }, [todosCnaes]);

  const handleModalidadeSelect = (mod: ModalidadeLicenca) => {
    setFormData(prev => ({
      ...prev,
      modalidade: mod,
      possui_atividade_industrial: temAtividadeFabril,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-slate-700" />
          Etapa 2: Inteligência de Enquadramento Legal e Análise de CNAE
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Cruzamento dos códigos CNAE com o Anexo IV da Lei Complementar Municipal nº 1.876/2023 e Resoluções CEPRAM nº 4.327/2013 e 4.579/2018.
        </p>
      </div>

      {/* BANNER 1: Caso A - Comércio Seco / Atipicidade */}
      {isApenasComercioSeco && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3">
          <Store className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900">
              Atipicidade Identificada (Comércio Seco / Serviços Administrativos)
            </h3>
            <p className="text-sm text-emerald-800 mt-1">
              Todos os CNAEs informados correspondem a atividades estritamente comerciais ou administrativas, sem estocagem de produtos perigosos ou processamento químico/físico no galpão.
            </p>
            <p className="text-xs text-emerald-700 mt-2 font-medium">
              Sugestão automática da ASTEC: <strong>Dispensa de Licença Ambiental (DLA)</strong> ou <strong>Declaração de Inexigibilidade</strong>.
            </p>
          </div>
        </div>
      )}

      {/* BANNER 2: Caso B - Alerta Vermelho (Atividade Industrial Detectada) */}
      {temAtividadeFabril && formData.modalidade === 'DISPENSA' && (
        <div className="p-5 bg-rose-50 border-2 border-rose-400 rounded-xl flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-7 h-7 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-bold text-rose-900 text-base">
              Alerta Técnico de Risco Ambiental (Atividade Fabril Identificada)
            </h3>
            <p className="text-sm text-rose-800 leading-relaxed font-medium">
              "Atenção: A empresa possui CNAE de fabricação. Verifique se o RCE declara montagem artesanal/sob demanda em bancada ou se a atividade fabril é exercida fora do galpão."
            </p>
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-rose-950 cursor-pointer bg-white px-3 py-2 rounded-lg border border-rose-300 inline-flex">
                <input
                  type="checkbox"
                  checked={formData.declaracao_artesanal_bancada}
                  onChange={e => setFormData(p => ({ ...p, declaracao_artesanal_bancada: e.target.checked }))}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                Constatado no RCE: Montagem artesanal/sob bancada sem efluentes industriais ou emissões atmosféricas
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de CNAEs Identificados */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Atividades Econômicas Identificadas na Receita Federal</span>
          <span className="text-xs font-normal text-slate-500">{todosCnaes.length} atividades cadastradas</span>
        </h3>

        {todosCnaes.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            Nenhum CNAE carregado. Volte à Etapa 1 e consulte o CNPJ ou digite manualmente.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {todosCnaes.map((c, idx) => {
              const isInd = PALAVRAS_CHAVE_INDUSTRIA.some(k => c.descricao.toLowerCase().includes(k));
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-sm flex items-start justify-between gap-3 ${
                    isInd
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold text-xs mr-2 text-slate-600">
                      {c.codigo}
                    </span>
                    <span className="font-medium">{c.descricao}</span>
                    {c.principal && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-semibold">
                        Principal
                      </span>
                    )}
                  </div>
                  {isInd && (
                    <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Industrial
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seletor Manual da Modalidade Final */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-3">
          Seletor de Modalidade Recomendada pela ASTEC:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleModalidadeSelect('DISPENSA')}
            className={`p-4 rounded-xl border-2 text-left transition ${
              formData.modalidade === 'DISPENSA'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-base">Dispensa (DLA)</span>
              {formData.modalidade === 'DISPENSA' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Atividades de baixo ou insignificante potencial poluidor (Anexo IV da LC 1.876/2023 e Res. CEPRAM).
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModalidadeSelect('INEXIGIBILIDADE')}
            className={`p-4 rounded-xl border-2 text-left transition ${
              formData.modalidade === 'INEXIGIBILIDADE'
                ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-400'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-base">Inexigibilidade</span>
              {formData.modalidade === 'INEXIGIBILIDADE' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Atividades não constantes no rol de licenciamento obrigatório (comércio seco, serviços de escritório).
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModalidadeSelect('LAS')}
            className={`p-4 rounded-xl border-2 text-left transition ${
              formData.modalidade === 'LAS'
                ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-400'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-base">Licença Simplificada (LAS)</span>
              {formData.modalidade === 'LAS' && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empreendimentos de pequeno porte e baixo/médio potencial poluidor com rito unificado.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
