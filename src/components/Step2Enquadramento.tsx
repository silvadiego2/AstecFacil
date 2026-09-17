import React, { useMemo, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Cpu, Store, RefreshCw, Sparkles } from 'lucide-react';
import { ProcessoFormData, ModalidadeLicenca } from '../types';
import { PALAVRAS_CHAVE_INDUSTRIA } from '../data/normativasCamacari';

interface Step2Props {
  formData: ProcessoFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProcessoFormData>>;
}

export const Step2Enquadramento: React.FC<Step2Props> = ({ formData, setFormData }) => {
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

  const cnaesIndustriais = useMemo(() => {
    return todosCnaes.filter(item => {
      const desc = item.descricao.toLowerCase();
      return PALAVRAS_CHAVE_INDUSTRIA.some((kw: string) => desc.includes(kw));
    });
  }, [todosCnaes]);

  const temAtividadeFabril = cnaesIndustriais.length > 0;

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
      ) && !PALAVRAS_CHAVE_INDUSTRIA.some((kw: string) => desc.includes(kw));
    });
  }, [todosCnaes]);

  // ENQUADRAMENTO AUTOMÁTICO INTELIGENTE
  useEffect(() => {
    if (formData.tipoSolicitacao === 'RENOVACAO') {
      if (formData.modalidade !== 'RENOVACAO_LAS') {
        setFormData(p => ({ ...p, modalidade: 'RENOVACAO_LAS', possui_atividade_industrial: temAtividadeFabril }));
      }
    } else if (temAtividadeFabril) {
      // Se tiver indústria e não for renovação, o padrão seguro é LAS
      if (formData.modalidade !== 'LAS' && formData.modalidade !== 'DISPENSA') {
        setFormData(p => ({ ...p, modalidade: 'LAS', possui_atividade_industrial: true }));
      }
    } else if (isApenasComercioSeco) {
      // Se for comércio puro, enquadra em Dispensa
      if (formData.modalidade !== 'DISPENSA' && formData.modalidade !== 'INEXIGIBILIDADE') {
        setFormData(p => ({ ...p, modalidade: 'DISPENSA', possui_atividade_industrial: false }));
      }
    }
  }, [formData.tipoSolicitacao, temAtividadeFabril, isApenasComercioSeco]);

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
          O sistema avaliou automaticamente o perfil do empreendimento com base na LC nº 1.876/2023 e Resoluções CEPRAM.
        </p>
      </div>

      {/* Badge de Indicação de Enquadramento Automático */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-blue-900 text-xs">
        <span className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Enquadramento sugerido pelo sistema: <strong>{
            formData.modalidade === 'RENOVACAO_LAS' ? 'Renovação de LAS' :
            formData.modalidade === 'DISPENSA' ? 'Dispensa de Licença (DLA)' :
            formData.modalidade === 'LAS' ? 'Licença Ambiental Simplificada (LAS)' : 'Inexigibilidade'
          }</strong>
        </span>
        <span className="text-[11px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded font-semibold">
          Auto-Identificado
        </span>
      </div>

      {/* BANNER 1: Comércio Seco */}
      {isApenasComercioSeco && formData.tipoSolicitacao !== 'RENOVACAO' && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3">
          <Store className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900">
              Atipicidade Identificada (Comércio Seco / Serviços Administrativos)
            </h3>
            <p className="text-sm text-emerald-800 mt-1">
              Todos os CNAEs informados correspondem a atividades estritamente comerciais ou administrativas. Enquadramento padrão recomendado: <strong>Dispensa de Licença Ambiental (DLA)</strong>.
            </p>
          </div>
        </div>
      )}

      {/* BANNER 2: Alerta Vermelho de Atividade Industrial */}
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

      {/* BANNER 3: Renovação de LAS */}
      {formData.tipoSolicitacao === 'RENOVACAO' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
          <RefreshCw className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">
              Processo de Renovação de Licença Ambiental Simplificada (RLAS)
            </h3>
            <p className="text-sm text-amber-800 mt-1">
              Conforme o Art. 14 da LC nº 1.876/2023, a renovação deve verificar o histórico de cumprimento das condicionantes da licença anterior e atestar que não houve ampliação física ou alteração na linha operacional.
            </p>
          </div>
        </div>
      )}

      {/* Tabela de CNAEs Identificados */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Atividades Econômicas da Empresa (Receita Federal)</span>
          <span className="text-xs font-normal text-slate-500">{todosCnaes.length} atividades cadastradas</span>
        </h3>

        {todosCnaes.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Nenhum CNAE informado na Etapa 1.</p>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {todosCnaes.map((c, idx) => {
              const isInd = PALAVRAS_CHAVE_INDUSTRIA.some((k: string) => c.descricao.toLowerCase().includes(k));
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-sm flex items-start justify-between gap-3 ${
                    isInd ? 'bg-rose-50/70 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold text-xs mr-2 text-slate-600">{c.codigo}</span>
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

      {/* Seletor Manual com 4 Opções */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-3">
          Modalidade Adotada no Parecer da ASTEC:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleModalidadeSelect('DISPENSA')}
            className={`p-4 rounded-xl border-2 text-left transition ${
              formData.modalidade === 'DISPENSA'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Dispensa (DLA)</span>
              {formData.modalidade === 'DISPENSA' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-xs text-slate-600">Baixo ou insignificante impacto poluidor.</p>
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
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Inexigibilidade</span>
              {formData.modalidade === 'INEXIGIBILIDADE' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-xs text-slate-600">Atividade não passível de licenciamento.</p>
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
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Licença Simplificada</span>
              {formData.modalidade === 'LAS' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
            </div>
            <p className="text-xs text-slate-600">Pequeno porte com potencial poluidor baixo/médio.</p>
          </button>

          <button
            type="button"
            onClick={() => handleModalidadeSelect('RENOVACAO_LAS')}
            className={`p-4 rounded-xl border-2 text-left transition ${
              formData.modalidade === 'RENOVACAO_LAS'
                ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-400'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Renovação de LAS</span>
              {formData.modalidade === 'RENOVACAO_LAS' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </div>
            <p className="text-xs text-slate-600">Revalidação de licença anterior vigente.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
