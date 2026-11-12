import { ComunicacaoExterna } from '../types';

export type ComunicacaoItem = ComunicacaoExterna & {
  tipo_assunto?: string;
  qtd_prorrogacoes?: number;
};

const TOKEN_KEY = 'astec_auth_token';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY) || '';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function tratarResposta(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('astec_auth_user');
    window.location.reload();
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

export async function listarComunicacoesApi(): Promise<ComunicacaoItem[]> {
  const res = await fetch('/api/comunicacoes', { headers: getHeaders() });
  return tratarResposta(res);
}

export async function criarComunicacaoApi(
  item: Omit<ComunicacaoItem, 'id' | 'created_at'>
): Promise<ComunicacaoItem> {
  const res = await fetch('/api/comunicacoes', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(item),
  });
  return tratarResposta(res);
}

export async function atualizarComunicacaoApi(
  id: string,
  campos: Partial<ComunicacaoItem>
): Promise<ComunicacaoItem> {
  const res = await fetch('/api/comunicacoes', {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ id, ...campos }),
  });
  return tratarResposta(res);
}

export async function excluirComunicacaoApi(id: string): Promise<void> {
  const res = await fetch(`/api/comunicacoes?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  await tratarResposta(res);
}
