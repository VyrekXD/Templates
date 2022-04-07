import { config as initializeENV } from 'dotenv'

if (!process.env.TOKEN) initializeENV()
if (process.argv.includes('DEV=true')) process.env.NODE_ENV = 'development'
else process.env.NODE_ENV = 'production'

const Token = (
	process.env.NODE_ENV === 'development'
		? process.env.TOKEN_DEV ?? process.env.TOKEN
		: process.env.TOKEN
) as string

export const config = {
	token: Token,
	devs: process.env.DEVS?.split(','),
	devServers: process.env.DEV_SERVERS?.split(',')
}
