import React, { useState } from 'react';
import { Search, Loader2, Building2, MapPin, AlertCircle } from 'lucide-react';
import { ProcessoFormData } from '../types';
import { ZONEAMENTOS_CAMACARI } from '../data/normativasCamacari';
import { consultarCnpjBrasilApi } from '../services/api';

interface Step1Props {
  formData: ProcessoFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProcessoFormData>>;
}

export const Step1Identificacao: React.FC<Step1Props> = ({ formData, setFormData }) => {
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [erroCnpj, setErroCnpj] = useState<string | null>(null);

  // Máscara dinâmica SIS-SEDUR: 00000.22.09.000.2026
  const handleProcessoChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 17);
    let masked = clean;
    if (clean.length > 5) masked = `${clean.slice(0, 5)}.${clean.slice(5)}`;
    if (clean.length > 7) masked = `${clean.slice(0, 5)}.${clean.slice(5, 7)}.${clean.slice(7)}`;
    if (clean.length > 9) masked = `${clean.slice(0, 5)}.${clean.slice(5, 7)}.${clean.slice(7, 9)}.${clean.slice(9)}`;
    if (clean.length > 12) masked = `${clean.slice(0, 5)}.${clean.slice(5, 7)}.${clean.slice(7, 9)}.${clean.slice(9, 12)}.${clean.slice(12, 16)}`;

    setFormData(prev => ({ ...prev, numero_processo: masked }));
  };

  const handleConsultarCnpj = async () => {
    const rawCnpj = formData.cnpj.replace(/\D/g, '');
    if (rawCnpj.length !== 14) {
      setErroCnpj('Informe um CNPJ válido com 14 dígitos antes de consultar.');
      return;
    }

    setLoadingCnpj(true);
    setErroCnpj(null);

    try {
      const data = await consultarCnpjBrasilApi(rawCnpj);
      const logradouroCompleto = [
        data.descricao_tipo_de_logradouro,
        data.logradouro,
        data.numero ? `nº ${data.numero}` : '',
        data.complemento
      ].filter(Boolean).join(' ');

      const principal = {
        codigo: data.cnae_fiscal,
        descricao: data.cnae_fiscal_descricao,
      };

      const secundarios = (data.cnaes_secundarios || []).map(c => ({
        codigo: c.codigo,
        descricao: c.descricao,
      }));

      setFormData(prev => ({
        ...prev,
        interessado: data.razao_social || data.nome_fantasia || prev.interessado,
        endereco: logradouroCompleto || prev.endereco,
        bairro: data.bairro || prev.bairro,
        cep: data.cep || prev.cep,
        cnae_principal: principal,
        cnaes_secundarios: secundarios,
      }));
    } catch (err: any) {
      setErroCnpj(err.message || 'Falha ao buscar dados na BrasilAPI. Preencha manualmente.');
    } finally {
      setLoadingCnpj(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-slate-700" />
          Etapa 1: Identificação do Processo e Localização
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Insira o número de protocolo do SIS-SEDUR e consulte o CNPJ do interessado via BrasilAPI para preenchimento automatizado.
        </p>
      </div>

      {erroCnpj && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>{erroCnpj}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Número do Processo SIS-SEDUR */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Número do Processo SIS-SEDUR *
          </label>
          <input
            type="text"
            value={formData.numero_processo}
            onChange={e => handleProcessoChange(e.target.value)}
            placeholder="Ex: 01452.22.09.001.2026"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 font-mono tracking-wide"
          />
          <span className="text-xs text-slate-400">Padrão municipal: XXXXX.22.09.XXX.AAAA</span>
        </div>

        {/* CNPJ e Botão BrasilAPI */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            CNPJ do Interessado *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.cnpj}
              onChange={e => setFormData(p => ({ ...p, cnpj: e.target.value }))}
              placeholder="00.000.000/0000-00"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 font-mono"
            />
            <button
              type="button"
              onClick={handleConsultarCnpj}
              disabled={loadingCnpj}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition disabled:opacity-50"
            >
              {loadingCnpj ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Consultar BrasilAPI
            </button>
          </div>
          <span className="text-xs text-slate-400">Integração pública direta com a Receita Federal</span>
        </div>

        {/* Razão Social / Interessado */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Razão Social / Requerente *
          </label>
          <input
            type="text"
            value={formData.interessado}
            onChange={e => setFormData(p => ({ ...p, interessado: e.target.value }))}
            placeholder="Nome empresarial completo da pessoa jurídica"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-600"
          />
        </div>

        {/* Endereço */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Logradouro e Número
          </label>
          <input
            type="text"
            value={formData.endereco}
            onChange={e => setFormData(p => ({ ...p, endereco: e.target.value }))}
            placeholder="Rua, Avenida, Rodovia, Lote, Galpão"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-600"
          />
        </div>

        {/* Bairro */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Bairro / Distrito de Camaçari
          </label>
          <input
            type="text"
            value={formData.bairro}
            onChange={e => setFormData(p => ({ ...p, bairro: e.target.value }))}
            placeholder="Ex: Ponto Certo, Polo Petroquímico, Catu de Abrantes, Guarajuba"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-600"
          />
        </div>

        {/* Área m² */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Área Construída / Galpão (m²)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.area_m2 || ''}
            onChange={e => setFormData(p => ({ ...p, area_m2: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-600"
          />
          <span className="text-xs text-slate-400">Área útil de operação declarada no RCE</span>
        </div>

        {/* Coordenadas */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-slate-500" />
            Coordenadas Geográficas (SIRGAS 2000 / Lat-Long)
          </label>
          <input
            type="text"
            value={formData.coordenadas}
            onChange={e => setFormData(p => ({ ...p, coordenadas: e.target.value }))}
            placeholder="Ex: -12.6975, -38.3241 ou UTM 24S 573210 / 8596540"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-600"
          />
        </div>

        {/* Zoneamento de Camaçari */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Macrozoneamento / Zoneamento Urbanístico (LC nº 1.873/2023 - PDDU)
          </label>
          <select
            value={formData.zona_urbanistica}
            onChange={e => setFormData(p => ({ ...p, zona_urbanistica: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-slate-600"
          >
            {ZONEAMENTOS_CAMACARI.map(z => (
              <option key={z.valor} value={z.valor}>
                {z.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
