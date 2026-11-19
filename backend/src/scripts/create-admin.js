import 'dotenv/config'
import bcrypt from 'bcrypt'
import { prisma } from '../db.js'

const [argUsername, argFullname, argPassword] = process.argv.slice(2)
const username = (argUsername ?? process.env.ADMIN_INITIAL_USERNAME)?.trim()
const fullname = (argFullname ?? process.env.ADMIN_INITIAL_FULLNAME)?.trim()
const password = argPassword ?? process.env.ADMIN_INITIAL_PASSWORD

if (!username || username.length > 80 || !fullname || fullname.length > 160 || !password || password.length < 8 || password.length > 200) {
  console.error('Set username (<=80), fullname (<=160), and password of 8–200 characters via CLI args or backend/.env.')
  process.exitCode = 1
} else {
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.admin.upsert({
      where: { username },
      update: { fullname, password: passwordHash },
      create: { username, fullname, password: passwordHash },
    })
    console.log('Admin account created or password updated successfully.')
  } catch (error) {
    console.error('Could not create/update admin account:', error.message)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}
