import { db } from '../../db';
import { refreshTokens } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export interface DbRefreshToken {
  id: string;
  token: string;
  userId: string;
  device?: string;
  ipAddress?: string;
  isRevoked: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

function mapTokenRow(row: any): DbRefreshToken {
  return {
    id: row.id,
    token: row.token,
    userId: row.userId,
    device: row.device ?? undefined,
    ipAddress: row.ipAddress ?? undefined,
    isRevoked: row.isRevoked,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class TokenRepository {
  async saveRefreshToken(tokenData: Omit<DbRefreshToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbRefreshToken> {
    const id = `rt-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();

    const newRecord = {
      id,
      token: tokenData.token,
      userId: tokenData.userId,
      device: tokenData.device ?? null,
      ipAddress: tokenData.ipAddress ?? null,
      isRevoked: tokenData.isRevoked ?? false,
      expiresAt: tokenData.expiresAt,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(refreshTokens).values(newRecord);
    return mapTokenRow(newRecord);
  }

  async findRefreshToken(token: string): Promise<DbRefreshToken | null> {
    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.token, token), eq(refreshTokens.isRevoked, false)));
    return row ? mapTokenRow(row) : null;
  }

  async revokeToken(token: string): Promise<boolean> {
    const [row] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    if (!row) return false;

    await db
      .update(refreshTokens)
      .set({ isRevoked: true, updatedAt: new Date().toISOString() })
      .where(eq(refreshTokens.token, token));
    return true;
  }

  async revokeAllUserTokens(userId: string): Promise<number> {
    const activeTokens = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.isRevoked, false)));

    if (activeTokens.length === 0) return 0;

    await db
      .update(refreshTokens)
      .set({ isRevoked: true, updatedAt: new Date().toISOString() })
      .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.isRevoked, false)));

    return activeTokens.length;
  }
}

export const tokenRepository = new TokenRepository();
