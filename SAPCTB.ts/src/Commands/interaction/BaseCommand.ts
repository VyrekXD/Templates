//https://github.com/detritusjs/client/blob/master/examples/ts/example-bots/commands/interactions/commands/basecommand.ts
/* eslint-disable*/
//@ts-ignore
//@ts-nocheck

import {
	Constants,
	Interaction,
	Structures,
	Utils,
	Collections
} from 'detritus-client'
import { config } from '../../Lib/config.js'
import { emojis, colors } from '../../Lib/constants.js'

const { ApplicationCommandTypes, ApplicationCommandOptionTypes, MessageFlags } =
	Constants
const { Embed, Markup } = Utils

type DecoratorCheckCallback = (
	ctx: Interaction.InteractionContext
) => Promise<any>

export class BaseInteractionCommand<
	ParsedArgsFinished = Interaction.ParsedArgs
> extends Interaction.InteractionCommand<ParsedArgsFinished> {
	error = 'Command'

	constructor(op?: Interaction.InteractionCommandOptions) {
		super(op)

		if (process.env.NODE_ENV === 'development') {
			this.global = false
			this.guildIds = new Collections.BaseSet(config.devServers)
		}
	}

	async onBefore(ctx) {
		if (
			this.onBeforeDecoratorChecks &&
			this.onBeforeDecoratorChecks.length
		) {
			let isOk = true

			for (const Check of this.onBeforeDecoratorChecks) {
				const evalr = await Check(ctx)

				if (evalr) {
					isOk = false
					break
				}
			}

			return isOk
		}

		return true
	}

	async onCancel(ctx: Interaction.InteractionContext) {
		if (
			this.onBeforeDecoratorChecks &&
			this.onBeforeDecoratorChecks.length
		) {
			let message

			for (const Check of this.onBeforeDecoratorChecks) {
				const evalr = await Check(ctx)
				if (evalr) message = evalr
			}

			if (message) {
				ctx.editOrRespond({
					content: message,
					flags: Constants.MessageFlags.EPHEMERAL
				})
			}
		}
	}

	onDmBlocked(context: Interaction.InteractionContext) {
		const command = Markup.codestring(context.name)
		return context.editOrRespond({
			content: `${emojis.error} | This command cannot be used in DMs.`,
			flags: MessageFlags.EPHEMERAL
		})
	}

	onRunError(
		context: Interaction.InteractionContext,
		args: ParsedArgsFinished,
		error: any
	) {
		const e = new Embed()
			.setColor(colors.error)
			.setDescription(Markup.codestring(String(error)))
			.setFooter(`Report the error to the dev`)

		return context.editOrRespond({
			embed,
			content: `${emojis.error} | An error occurred while running the command.`,
			flags: MessageFlags.EPHEMERAL
		})
	}

	onValueError(
		context: Interaction.InteractionContext,
		args: Interaction.ParsedArgs,
		errors: Interaction.ParsedErrors
	) {
		const embed = new Embed().setColor(colors.info)

		const store: { [key: string]: string } = {}

		const description: Array<string> = ['Invalid Argument' + '\n']
		for (let key in errors) {
			const message = errors[key].message
			if (message in store) {
				description.push(
					`**${key}**: Is the same as **${store[message]}**`
				)
			} else {
				description.push(`**${key}**: ${message}`)
			}
			store[message] = key
		}

		embed.setDescription(description.join('\n'))
		return context.editOrRespond({
			embed,
			content: `${emojis.info} | Invalid arguments, more info:`,
			flags: MessageFlags.EPHEMERAL
		})
	}
}

export class BaseCommandOption<
	ParsedArgsFinished = Interaction.ParsedArgs
> extends Interaction.InteractionCommandOption<ParsedArgsFinished> {
	type = ApplicationCommandOptionTypes.SUB_COMMAND
}

export class BaseCommandOptionGroup<
	ParsedArgsFinished = Interaction.ParsedArgs
> extends Interaction.InteractionCommandOption<ParsedArgsFinished> {
	type = ApplicationCommandOptionTypes.SUB_COMMAND_GROUP
}

export class BaseSlashCommand<
	ParsedArgsFinished = Interaction.ParsedArgs
> extends BaseInteractionCommand<ParsedArgsFinished> {
	error = 'Slash Command'
	type = ApplicationCommandTypes.CHAT_INPUT
}

export interface ContextMenuMessageArgs {
	message: Structures.Message
}

export class BaseContextMenuMessageCommand extends BaseInteractionCommand<ContextMenuMessageArgs> {
	error = 'Message Context Menu'
	type = ApplicationCommandTypes.MESSAGE
}

export interface ContextMenuUserArgs {
	member?: Structures.Member
	user: Structures.User
}

export class BaseContextMenuUserCommand extends BaseInteractionCommand<ContextMenuUserArgs> {
	error = 'User Context Menu'
	type = ApplicationCommandTypes.USER
}
