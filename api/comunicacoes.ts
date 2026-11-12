import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

function validarToken(authHeader: string | undefined, secret: string): boolean {
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;

  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expectedSig) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.AUTH_SECRET;
  const dbUrl = process.env.DATABASE_URL;

  if (!secret || !dbUrl) {
    return res.status(500).json({ error: 'Banco de dados ou chave de autenticação não configurados.' });
  }

  if (!validarToken(req.headers.authorization, secret)) {
    return res.status(401).json({ error: 'Sessão expirada ou não autorizada.' });
  }

  const sql = neon(dbUrl);

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, numero_processo, interessado, setor_origem,
               to_char(data_envio, 'YYYY-MM-DD') AS data_envio,
               prazo_dias,
               to_char(data_limite, 'YYYY-MM-DD') AS data_limite,
               documentos, observacoes, created_at
        FROM comunicacoes_externas
        ORDER BY data_limite ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { numero_processo, interessado, setor_origem, data_envio, prazo_dias, data_limite, documentos, observacoes } = req.body;
      const rows = await sql`
        INSERT INTO comunicacoes_externas (
          numero_processo, interessado, setor_origem, data_envio, prazo_dias, data_limite, documentos, observacoes
        ) VALUES (
          ${numero_processo}, ${interessado}, ${setor_origem}, ${data_envio}, ${Number(prazo_dias)}, ${data_limite},
          ${JSON.stringify(documentos || [])}::jsonb, ${observacoes || null}
        )
        RETURNING id, numero_processo, interessado, setor_origem,
                  to_char(data_envio, 'YYYY-MM-DD') AS data_envio,
                  prazo_dias,
                  to_char(data_limite, 'YYYY-MM-DD') AS data_limite,
                  documentos, observacoes, created_at
      `;
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PATCH') {
      const { id, documentos, observacoes, setor_origem, data_envio, prazo_dias, data_limite } = req.body;
      if (!id) return res.status(400).json({ error: 'ID obrigatório' });

      const rows = await sql`
        UPDATE comunicacoes_externas
        SET documentos = COALESCE(${documentos ? JSON.stringify(documentos) : null}::jsonb, documentos),
            observacoes = COALESCE(${observacoes ?? null}, observacoes),
            setor_origem = COALESCE(${setor_origem ?? null}, setor_origem),
            data_envio = COALESCE(${data_envio ?? null}::date, data_envio),
            prazo_dias = COALESCE(${prazo_dias ?? null}::integer, prazo_dias),
            data_limite = COALESCE(${data_limite ?? null}::date, data_limite)
        WHERE id = ${id}::uuid
        RETURNING id, numero_processo, interessado, setor_origem,
                  to_char(data_envio, 'YYYY-MM-DD') AS data_envio,
                  prazo_dias,
                  to_char(data_limite, 'YYYY-MM-DD') AS data_limite,
                  documentos, observacoes, created_at
      `;
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) return res.status(400).json({ error: 'ID obrigatório' });
      await sql`DELETE FROM comunicacoes_externas WHERE id = ${String(id)}::uuid`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Erro interno no banco de dados.' });
  }
}
