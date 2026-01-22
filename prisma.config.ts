import path from 'node:path'
import { defineConfig } from 'prisma/config'

// データベースファイルの絶対パスを取得
const dbPath = path.join(__dirname, 'data', 'database.db')

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),

  migrate: {
    async url() {
      return process.env.DATABASE_URL || `file:${dbPath}`
    },
  },
})
