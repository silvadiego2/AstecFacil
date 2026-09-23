// src/components/Step2Enquadramento.tsx
import React, { useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Cpu, 
  Store, 
  RefreshCw, 
  Sparkles, 
  Fuel, 
  Pickaxe, 
  Building, 
  Radio, 
  HardHat 
} from 'lucide-react';
import { ProcessoFormData, ModalidadeLicenca, TipologiaAtividade } from '../types';
import { detectarTipologiaPorCnaes } from '../data/normativasCamacari';

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

  // Detecção da Tipologia a partir dos CNAEs da empresa
  const tipologiaDetectada = useMemo(() => {
    return detectarTipologiaPorCnaes(todosCnaes);
  }, [todosCnaes]);

  // Aplica a tipologia identificada automaticamente
  useEffect(() => {
    if (tipologiaDetectada && tipologiaDetectada !== 'GERAL' && (!formData.tipologia_atividade || formData.tipologia_atividade === 'GERAL')) {
      setFormData(prev => ({ ...prev, tipologia_atividade: tipologiaDetectada }));
    }
  }, [tipologiaDetectada]);

  // Enquadramento automático da modalidade
  useEffect(() => {
    if (formData.tipoSolicitacao === 'RENOVACAO') {
      if (formData.modalidade !== 'RENOVACAO_LAS') {
        setFormData(p => ({ ...p, modalidade: 'RENOVACAO_LAS' }));
      }
    } else if (['POSTO_COMBUSTIVEL', 'MINERACAO', 'URBANISTICO', 'OBRA', 'ERB'].includes(formData.tipologia_atividade)) {
      if (formData.modalidade !== 'LAS' && formData.modalidade !== 'RENOVACAO_LAS') {
        setFormData(p => ({ ...p, modalidade: 'LAS' }));
      }
    }
  }, [formData.tipoSolicitacao, formData.tipologia_atividade]);

  const handleModalidadeSelect = (mod: ModalidadeLicenca) => {
    setFormData(prev => ({ ...prev, modalidade: mod }));
  };

  const handleTipologiaSelect = (tip: TipologiaAtividade) => {
    setFormData(prev => ({ ...prev, tipologia_atividade: tip }));
  };

  const badgeTipologia = {
    POSTO_COMBUSTIVEL: { label: 'Posto de Combustíveis', icon: Fuel, cor: 'bg-amber-100 text-amber-900 border-amber-300' },
    MINERACAO: { label: 'Mineração / Extração Mineral', icon: Pickaxe, cor: 'bg-orange-100 text-orange-900 border-orange-300' },
    URBANISTICO: { label: 'Empreendimento Urbanístico / Loteamento', icon: Building, cor: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    OBRA: { label: 'Obras / Construção Civil', icon: HardHat, cor: 'bg-blue-100 text-blue-900 border-blue-300' },
    ERB: { label: 'Estação Rádio Base (ERB / Antena)', icon: Radio, cor: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
    GERAL: { label: 'Geral / Serviços / Indústria', icon: Store, cor: 'bg-slate-100 text-slate-900 border-slate-300' },
  }[formData.tipologia_atividade || 'GERAL'];

  const IconeTipologia = badgeTipologia.icon;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-slate-700" />
          Etapa 2: Tipologia do Empreendimento e Enquadramento Legal
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          O sistema analisou os CNAEs da empresa para aplicar a matriz documental oficial da SEDUR Camaçari.
        </p>
      </div>

      {/* Card da Tipologia Detectada */}
      <div className={`p-4 border rounded-xl flex items-center justify-between shadow-sm ${badgeTipologia.cor}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-lg shadow-sm">
            <IconeTipologia className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold opacity-75 uppercase tracking-wide">
              Tipologia Setorial do Empreendimento:
            </div>
            <div className="text-base font-bold">
              {badgeTipologia.label}
            </div>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-full shadow-sm flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Identificado via CNAE
        </span>
      </div>

      {/* Seletor Manual de Tipologia */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Alternar Rito Documental Específico da SEDUR (se necessário):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {(['GERAL', 'POSTO_COMBUSTIVEL', 'MINERACAO', 'URBANISTICO', 'OBRA', 'ERB'] as TipologiaAtividade[]).map(t => {
            const ativo = formData.tipologia_atividade === t;
            const labels = {
              GERAL: 'Geral',
              POSTO_COMBUSTIVEL: 'Posto',
              MINERACAO: 'Mineração',
              URBANISTICO: 'Urbanístico',
              OBRA: 'Obras',
              ERB: 'ERB / Antena'
            };
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleTipologiaSelect(t)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  ativo 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seletor de Modalidade */}
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
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Dispensa (DLA)</span>
              {formData.modalidade === 'DISPENSA' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-xs text-slate-600">Baixo/insignificante impacto (Art. 53, § 2º LC 1.876/2023).</p>
          </button>

          <button
            type="button"
            onClick={() => handleModalidadeSelect('LAS')}
            className={`p-4 rounded-xl border-2 text-left transition ${
              formData.modalidade === 'LAS'
                ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-400 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Licença Simplificada (LAS)</span>
              {formData.modalidade === 'LAS' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
            </div>
            <p className="text-xs text-slate-600">Postos, Mineração, Obras, Urbanístico e Indústria Classes 1 e 2.</p>
          </button>

          <button
            type="button"
            onClick={() => handleModalidadeSelect('RENOVACAO_LAS')}
            className={`p-4 rounded-xl border-2 text-left transition ${
              formData.modalidade === 'RENOVACAO_LAS'
                ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-400 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Renovação de LAS</span>
              {formData.modalidade === 'RENOVACAO_LAS' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </div>
            <p className="text-xs text-slate-600">Revalidação de licença anterior com condicionantes cumpridas.</p>
          </button>

          <button
            type="button"
            onClick={() => handleModalidadeSelect('INEXIGIBILIDADE')}
            className={`p-4 rounded-xl border-2 text-left transition ${
              formData.modalidade === 'INEXIGIBILIDADE'
                ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-400 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Inexigibilidade</span>
              {formData.modalidade === 'INEXIGIBILIDADE' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-xs text-slate-600">Construções e reformas isentas de licenciamento ambiental.</p>
          </button>
        </div>
      </div>

      {/* Tabela de CNAEs */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Atividades Econômicas Informadas na Receita</span>
          <span className="text-xs font-normal text-slate-500">{todosCnaes.length} cadastradas</span>
        </h3>

        {todosCnaes.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Consulte o CNPJ na Etapa 1 para carregar a lista de CNAEs.</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {todosCnaes.map((c, idx) => (
              <div key={idx} className="p-2 rounded bg-white border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-700 mr-2">{c.codigo}</span>
                  <span>{c.descricao}</span>
                </div>
                {c.principal && (
                  <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
