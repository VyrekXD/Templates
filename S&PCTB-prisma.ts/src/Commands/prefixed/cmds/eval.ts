import * as detritus from 'detritus-client'
import { exec } from 'child_process'
import { inspect, promisify } from 'util'

import { BaseCommand } from '../BaseCommand.js'
import {
	splitMessage,
	cleanCodeBlockContent
} from '../../../Lib/MessageUtils.js'
import { config } from '../../../Lib/config.js'

interface Args {
	option: string
	eval: string
}

const options = ['default', 'async', 'shell']
const shell = promisify(exec)
const splitMessages = (text: string) =>
	splitMessage(text, {
		maxLength: 1950,
		char: ''
	})

export default class EvalCommand extends BaseCommand {
	constructor(client: detritus.CommandClient) {
		super(client, {
			name: 'eval',
			aliases: ['e'],
			args: [
				{
					name: 'option',
					type: String,
					default: 'default'
				}
			]
		})
	}

	onBeforeRun(ctx: detritus.Command.Context) {
		if (!config.devs?.includes(ctx.userId)) return false
		else return true
	}

	async run(ctx: detritus.Command.Context, args: Args) {
		if (!options.includes(args.option))
			return ctx.editOrReply({
				content: `Option must be one of: ${options.join(', ')}`
			})
		if (!args.eval) return ctx.editOrReply({ content: 'No code provided' })

		const modConfig = { ...config }
		//@ts-ignore
		delete modConfig.devs

		const keys = [...(Object.values(modConfig) as string[])]
		const regex = new RegExp(
			'(' +
				keys
					.map((i) => i.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&'))
					.join('|') +
				')',
			'gmi'
		)

		switch (args.option) {
			case 'default': {
				await customEval(ctx, args, regex)
				break
			}
			case 'async': {
				await customEval(ctx, args, regex, true)
				break
			}
			case 'shell': {
				try {
					await shell(args.eval)
						.then((executed): any => {
							const { stdout, stderr } = executed
							if (!stdout && !stderr)
								return ctx.editOrReply(
									'Se ejecuto el comando pero no hubo salida'
								)
							if (stdout) {
								return ctx.editOrReply({
									content: `\`\`\`sh\n${
										splitMessages(stdout)[0]
									}\`\`\``
								})
							}
							if (stderr) {
								return ctx.editOrReply({
									content: `\`\`\`sh\n${
										splitMessages(stderr)[0]
									}\`\`\``
								})
							}
						})
						.catch((e) => {
							if (typeof e !== 'string')
								e = inspect(e, {
									depth: 0,
									showHidden: true
								})

							ctx.editOrReply({
								content: `\`\`\`sh\n${
									splitMessages(e)[0]
								}\`\`\``
							})
						})
				} catch (e) {
					let err: string = e as string
					if (typeof e !== 'string')
						err = inspect(err, {
							depth: 0,
							showHidden: true
						})

					ctx.editOrReply({
						content: `\`\`\`sh\n${splitMessages(err)[0]}\`\`\``
					})
				}

				break
			}
		}

		return
	}
}

const customEval = async (
	ctx: detritus.Command.Context,
	args: Args,
	Regex: RegExp,
	async = false
) => {
	try {
		const time = Date.now()
		let evaluated = await eval(
			async ? `(async()=>{${args.eval}})()` : args.eval
		)
		const type = typeof evaluated

		if (typeof evaluated !== 'string')
			evaluated = inspect(evaluated, {
				depth: 0,
				showHidden: true
			})

		evaluated = evaluated.replace(Regex, '[PRIVATE]')

		if (evaluated.length > 1024) {
			let contents = splitMessages(evaluated)
			contents = contents.map(
				(x) => `\`\`\`js\n${cleanCodeBlockContent(x)}\`\`\``
			)

			if (contents.length > 5) {
				contents[0] = `Showing only 5 messages, total messages: ${contents.length} (Eval length: ${evaluated.length})\n${contents[0]}`
				contents.splice(4, contents.length - 5)
			}

			ctx.editOrReply({ content: 'Check MD' })

			const dm = await ctx.user.createOrGetDm()

			return contents.forEach((x) =>
				dm.createMessage({
					content: x
				})
			)
		}

		const e = new detritus.Utils.Embed()
			.setColor(Math.floor(Math.random() * 0xffffff))
			.setDescription(`\`\`\`js\n${evaluated}\`\`\``)
			.addField(
				'**Time**',
				`\`\`\`autohotkey\n${Date.now() - time}ms\`\`\``,
				true
			)
			.addField('**Type**', `\`\`\`fix\n${type}\`\`\``, true)
			.setTimestamp()

		return ctx.editOrReply({ embeds: [e] })
	} catch (e: any) {
		if (e.length > 1950) {
			let contents = splitMessages(e.toString())
			contents = contents.map(
				(x) => `\`\`\`\n${cleanCodeBlockContent(x)}\`\`\``
			)

			if (contents.length > 5) {
				contents[0] = `Showing only 5 messages, total messages: ${
					contents.length
				} (Error length: ${e.toString().length})\n${
					contents[0]
				}\nError Output: \n`
				contents.splice(4, contents.length - 5)
			}

			ctx.editOrReply({ content: 'Check MD' })

			const dm = await ctx.user.createOrGetDm()

			return contents.forEach((x) =>
				dm.createMessage({
					content: x
				})
			)
		}

		ctx.editOrReply({
			content: `Error Output:\n\`\`\`sh\n${cleanCodeBlockContent(
				e.toString()
			)}\`\`\``
		})
	}
}
