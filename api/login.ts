import crypto from 'crypto';

type ApiReq = { method?: string; body?: any };
type ApiRes = { status: (code: number) => ApiRes; json: (data: any) => void };

function gerarToken(usuario: string, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({ user: usuario, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export default function handler(req: ApiReq, res: ApiRes) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { usuario, senha } = req.body || {};
  const senhaEsperada = process.env.ASTEC_SENHA;
  const secret = process.env.AUTH_SECRET;

  if (!senhaEsperada || !secret) {
    return res.status(500).json({ error: 'Variáveis ASTEC_SENHA ou AUTH_SECRET não configuradas na Vercel.' });
  }

  if (!usuario || senha !== senhaEsperada) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
  }

  const token = gerarToken(String(usuario).trim(), secret);
  return res.status(200).json({ token, usuario: String(usuario).trim() });
}
