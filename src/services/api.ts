// src/services/api.ts
import { BrasilApiCnpjResponse, ProcessoFormData } from '../types';

const BASE_URL_API = 'api.php';
const STORAGE_KEY = 'astec_facil_processos_locais';

// ==========================================
// 1. Consulta BrasilAPI
// ==========================================
export async function consultarCnpjBrasilApi(cnpjLimpo: string): Promise<BrasilApiCnpjResponse> {
  const cnpjApenasNumeros = cnpjLimpo.replace(/\D/g, '');
  if (cnpjApenasNumeros.length !== 14) {
    throw new Error('CNPJ deve conter exatamente 14 dígitos numéricos.');
  }

  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjApenasNumeros}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('CNPJ não encontrado na base da Receita Federal via BrasilAPI.');
    }
    throw new Error(`Erro na consulta do CNPJ: HTTP ${response.status}`);
  }

  return response.json();
}

// ==========================================
// Helpers para o Fallback em LocalStorage
// ==========================================
function obterProcessosLocalStorage(): any[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function salvarProcessosLocalStorage(processos: any[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(processos));
  } catch (err) {
    console.warn('Falha ao gravar no localStorage:', err);
  }
}

// ==========================================
// 2. Salvar Processo (MySQL com fallback)
// ==========================================
export async function salvarProcessoNoMysql(
  dados: ProcessoFormData
): Promise<{ success: boolean; id: number; message: string }> {
  try {
    const response = await fetch(`${BASE_URL_API}?action=salvar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    if (response.ok) {
      const resJson = await response.json();
      if (resJson.success) {
        return resJson;
      }
    }
    // Se a resposta não for bem-sucedida (ex: 404 na Vercel), aciona o fallback
    throw new Error('Backend PHP indisponível.');
  } catch (err) {
    // Fallback: persistência no navegador
    const lista = obterProcessosLocalStorage();
    const agora = new Date().toISOString();

    if (dados.id) {
      // Atualização
      const index = lista.findIndex(p => p.id === dados.id);
      if (index !== -1) {
        lista[index] = { ...lista[index], ...dados };
        salvarProcessosLocalStorage(lista);
        return {
          success: true,
          id: dados.id,
          message: 'Processo atualizado no armazenamento local (Modo Demonstração / Vercel).',
        };
      }
    }

    // Novo Registro
    const novoId = lista.length > 0 ? Math.max(...lista.map(p => p.id || 0)) + 1 : 1;
    const novoProcesso = {
      ...dados,
      id: novoId,
      created_at: agora,
    };

    lista.unshift(novoProcesso);
    salvarProcessosLocalStorage(lista);

    return {
      success: true,
      id: novoId,
      message: 'Processo salvo no armazenamento local (Modo Demonstração / Vercel).',
    };
  }
}

// ==========================================
// 3. Listar Processos (MySQL com fallback)
// ==========================================
export async function listarProcessosSalvos(
  pagina = 1,
  limite = 10,
  busca = ''
): Promise<{ success: boolean; total: number; pagina: number; total_paginas: number; dados: any[] }> {
  try {
    const url = `${BASE_URL_API}?action=listar&pagina=${pagina}&limite=${limite}&busca=${encodeURIComponent(busca)}`;
    const response = await fetch(url);

    if (response.ok) {
      const resJson = await response.json();
      if (resJson.success) {
        return resJson;
      }
    }
    throw new Error('Backend PHP indisponível.');
  } catch (err) {
    // Fallback: leitura e filtro no LocalStorage
    let lista = obterProcessosLocalStorage();

    if (busca.trim() !== '') {
      const termo = busca.toLowerCase();
      lista = lista.filter(
        p =>
          (p.numero_processo && p.numero_processo.toLowerCase().includes(termo)) ||
          (p.cnpj && p.cnpj.toLowerCase().includes(termo)) ||
          (p.interessado && p.interessado.toLowerCase().includes(termo))
      );
    }

    const total = lista.length;
    const offset = (pagina - 1) * limite;
    const dadosPaginados = lista.slice(offset, offset + limite);

    return {
      success: true,
      total,
      pagina,
      total_paginas: Math.ceil(total / limite) || 1,
      dados: dadosPaginados,
    };
  }
}

// ==========================================
// 4. Excluir Processo (MySQL com fallback)
// ==========================================
export async function excluirProcesso(id: number): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL_API}?action=excluir&id=${id}`, { method: 'POST' });
    if (response.ok) {
      const resJson = await response.json();
      if (resJson.success) return;
    }
    throw new Error('Backend PHP indisponível.');
  } catch (err) {
    // Fallback: exclusão no LocalStorage
    const lista = obterProcessosLocalStorage();
    const filtrados = lista.filter(p => p.id !== id);
    salvarProcessosLocalStorage(filtrados);
  }
}
