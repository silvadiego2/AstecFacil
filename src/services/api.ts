import { BrasilApiCnpjResponse, ProcessoFormData } from '../types';

const BASE_URL_API = 'api.php';

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

export async function salvarProcessoNoMysql(dados: ProcessoFormData): Promise<{ success: boolean; id: number; message: string }> {
  const response = await fetch(`${BASE_URL_API}?action=salvar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  const resJson = await response.json();
  if (!response.ok || !resJson.success) {
    throw new Error(resJson.error || 'Erro ao persistir dados no banco de dados da HostGator.');
  }

  return resJson;
}

export async function listarProcessosSalvos(pagina = 1, limite = 10, busca = ''): Promise<any> {
  const url = `${BASE_URL_API}?action=listar&pagina=${pagina}&limite=${limite}&busca=${encodeURIComponent(busca)}`;
  const response = await fetch(url);
  const resJson = await response.json();
  if (!response.ok || !resJson.success) {
    throw new Error(resJson.error || 'Erro ao listar processos.');
  }
  return resJson;
}

export async function excluirProcesso(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL_API}?action=excluir&id=${id}`, { method: 'POST' });
  const resJson = await response.json();
  if (!response.ok || !resJson.success) {
    throw new Error(resJson.error || 'Erro ao excluir processo.');
  }
}
