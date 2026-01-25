import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'node:path'

// データベースファイルのパスを取得
const getDbUrl = () => {
  const envUrl = process.env.DATABASE_URL
  if (envUrl) {
    // file:./data/database.db 形式から絶対パスに変換
    const match = envUrl.match(/^file:(.+)$/)
    if (match) {
      const filePath = match[1]
      // 相対パスの場合は絶対パスに変換
      if (filePath.startsWith('./') || filePath.startsWith('.\\')) {
        return path.join(process.cwd(), filePath.slice(2))
      }
      return filePath
    }
  }
  return path.join(process.cwd(), 'data', 'database.db')
}

// Prismaアダプターを作成（url プロパティを持つオブジェクトを渡す）
const adapter = new PrismaBetterSqlite3({ url: getDbUrl() })

// グローバルでPrismaClientインスタンスを保持（開発時のホットリロード対策）
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// PrismaClientのシングルトンインスタンス
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter })

// 開発環境ではグローバルに保持
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
