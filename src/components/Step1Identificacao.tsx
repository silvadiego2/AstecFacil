import React, { useState } from 'react';
import { Search, Loader2, Building2, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
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

      setFormData(prev => ({
        ...prev,
        interessado: data.razao_social || data.nome_fantasia || prev.interessado,
        endereco: logradouroCompleto || prev.endereco,
        bairro: data.bairro || prev.bairro,
        cep: data.cep || prev.cep,
        cnae_principal: {
          codigo: data.cnae_fiscal,
          descricao: data.cnae_fiscal_descricao,
        },
        cnaes_secundarios: (data.cnaes_secundarios || []).map(c => ({
          codigo: c.codigo,
          descricao: c.descricao,
        })),
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
          Etapa 1: Identificação do Processo e Tipo de Requerimento
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Informe o protocolo do SIS-SEDUR, o tipo de solicitação e faça a busca cadastral do CNPJ.
        </p>
      </div>

      {erroCnpj && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>{erroCnpj}</div>
        </div>
      )}

      {/* Seletor de Tipo de Solicitação */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <label className="block text-sm font-bold text-slate-800 mb-2">
          Natureza da Demanda Administrativa:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className={`p-3 rounded-lg border-2 flex items-center gap-3 cursor-pointer transition ${
            formData.tipoSolicitacao === 'NOVA_LICENCA' 
              ? 'border-slate-800 bg-white shadow-sm font-semibold' 
              : 'border-slate-200 bg-slate-100 text-slate-600'
          }`}>
            <input
              type="radio"
              name="tipoSolicitacao"
              checked={formData.tipoSolicitacao === 'NOVA_LICENCA'}
              onChange={() => setFormData(p => ({ ...p, tipoSolicitacao: 'NOVA_LICENCA' }))}
              className="text-slate-800 focus:ring-slate-700"
            />
            <div>
              <div className="text-sm">Novo Ato / Primeira Emissão</div>
              <div className="text-xs text-slate-500">Dispensa (DLA), Licença Simplificada (LAS) ou Inexigibilidade</div>
            </div>
          </label>

          <label className={`p-3 rounded-lg border-2 flex items-center gap-3 cursor-pointer transition ${
            formData.tipoSolicitacao === 'RENOVACAO' 
              ? 'border-emerald-600 bg-emerald-50 shadow-sm font-semibold text-emerald-950' 
              : 'border-slate-200 bg-slate-100 text-slate-600'
          }`}>
            <input
              type="radio"
              name="tipoSolicitacao"
              checked={formData.tipoSolicitacao === 'RENOVACAO'}
              onChange={() => setFormData(p => ({ ...p, tipoSolicitacao: 'RENOVACAO', modalidade: 'RENOVACAO_LAS' }))}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-sm">Renovação de Licença Ambiental Simplificada (RLAS)</div>
                <div className="text-xs text-slate-500">Empreendimento já licenciado anteriormente na SEDUR</div>
              </div>
            </div>
          </label>
        </div>

        {formData.tipoSolicitacao === 'RENOVACAO' && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Portaria ou Número da Licença Anterior a Renovar:
            </label>
            <input
              type="text"
              value={formData.numeroLicencaAnterior || ''}
              onChange={e => setFormData(p => ({ ...p, numeroLicencaAnterior: e.target.value }))}
              placeholder="Ex: Portaria SEDUR nº 084/2023 ou LAS nº 2023-0145"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Número do Processo */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Número do Processo SIS-SEDUR *
          </label>
          <input
            type="text"
            value={formData.numero_processo}
            onChange={e => handleProcessoChange(e.target.value)}
            placeholder="Ex: 01452.22.09.001.2026"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono tracking-wide"
          />
        </div>

        {/* CNPJ */}
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
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
            <button
              type="button"
              onClick={handleConsultarCnpj}
              disabled={loadingCnpj}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition disabled:opacity-50"
            >
              {loadingCnpj ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Consultar
            </button>
          </div>
        </div>

        {/* Razão Social */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Razão Social / Requerente *
          </label>
          <input
            type="text"
            value={formData.interessado}
            onChange={e => setFormData(p => ({ ...p, interessado: e.target.value }))}
            placeholder="Nome empresarial completo da pessoa jurídica"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        {/* Coordenadas */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-slate-500" />
            Coordenadas Geográficas (SIRGAS 2000)
          </label>
          <input
            type="text"
            value={formData.coordenadas}
            onChange={e => setFormData(p => ({ ...p, coordenadas: e.target.value }))}
            placeholder="Ex: -12.6975, -38.3241 ou UTM 24S 573210 / 8596540"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        {/* Zoneamento */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Macrozoneamento Urbanístico (PDDU - LC nº 1.873/2023)
          </label>
          <select
            value={formData.zona_urbanistica}
            onChange={e => setFormData(p => ({ ...p, zona_urbanistica: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
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
