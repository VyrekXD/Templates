import { Interaction, Utils } from 'detritus-client'
import { BaseSlashCommand } from '../BaseCommand.js'

export default class pingCommand extends BaseSlashCommand {
	name = 'ping'
	description = 'Get the ping of the bot'

	constructor() {
		super({
			options: []
		})
	}

	async run(ctx: Interaction.InteractionContext) {
		const ClientPing = await ctx.client.ping()
		const Pings = [
			`📤 Gateway Ping: ${ClientPing.gateway} ms (\`${getEmoji(
				ClientPing.gateway
			)}\`)`,
			`📡 API ping: ${ClientPing.rest} ms (\`${getEmoji(
				ClientPing.rest
			)}\`)`,
			`📨 Message delay: ${
				ctx.interaction.createdAt.getTime() - Date.now()
			} ms (\`${getEmoji(
				Date.now() - ctx.interaction.createdAt.getMilliseconds()
			)}\`)`
		]

		const e = new Utils.Embed()
			.setColor(Math.floor(Math.random() * 0xffffff))
			.setDescription(Pings.join('\n'))

		await ctx.editOrRespond({ embed: e })
	}
}

const getEmoji = (ping: number) => {
	if (ping <= 60) {
		return '🟢'
	} else if (ping > 60 && ping < 130) {
		return '🟠'
	} else if (ping < 200) {
		return '🔴'
	} else {
		return '⚫'
	}
}
