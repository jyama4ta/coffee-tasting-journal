import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import path from 'node:path'

// データベースファイルのパス（絶対パスに変換）
const getDbPath = () => {
  const envUrl = process.env.DATABASE_URL
  if (envUrl) {
    // file:./data/database.db 形式の場合、絶対パスに変換
    if (envUrl.startsWith('file:./')) {
      const relativePath = envUrl.replace('file:./', '')
      return `file:${path.join(process.cwd(), relativePath)}`
    }
    return envUrl
  }
  return `file:${path.join(process.cwd(), 'data', 'database.db')}`
}

// libSQLクライアントを作成
const libsql = createClient({
  url: getDbPath(),
})

// Prismaアダプターを作成
const adapter = new PrismaLibSQL(libsql)

// グローバルでPrismaClientインスタンスを保持（開発時のホットリロード対策）
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// PrismaClientのシングルトンインスタンス
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  })

// 開発環境ではグローバルに保持
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
