import { KufaConsole } from 'kufa'

export const prefix = '!'

export const Console = new KufaConsole({
	timeZone: 'America/Mexico_City',
	onlyHours: true,
	traceFun: true,
	format: false || `[§a%time%§r] [%prefix%§r] %message%`,
	log_prefix: false || `§2LOG`,
	warn_prefix: false || `§6WARN`,
	error_prefix: false || `§4ERROR`,
	depth: 2,
	parser: (ctx) => {
		ctx.str = `§4[BaraSupremacy]§r ${ctx.str}`
	}
})

export const cache = {
	applications: true,
	channels: true,
	connectedAccounts: false,
	emojis: true,
	guilds: true,
	interactions: true,
	members: true,
	messages: true,
	notes: true,
	presences: true,
	relationships: true,
	roles: true,
	sessions: false,
	stickers: true,
	typings: false,
	users: true,
	voiceCalls: true,
	voiceConnections: true,
	voiceStates: true
}

export const colors = {
	error: 0xf42c2c,
	good: 0x2cd649,
	info: 0xefe92d
}

export const emojis = {
	error: '<:error:928026398310948874>',
	good: '<:good:928026400508760074>',
	info: '<:info:928026400202571817>'
}
