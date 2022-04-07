import { Command, Utils } from 'detritus-client'

export class BaseCommand<
	ParsedArgsFinished = Command.ParsedArgs
> extends Command.Command<ParsedArgsFinished> {
	permissionsIgnoreClientOwner = true
	triggerTypingAfter = 2000

	async onRunError(
		context: Command.Context,
		_: ParsedArgsFinished,
		error: any
	) {
		const embed = new Utils.Embed()
		embed.setTitle(`⚠ Command Error`)
		embed.setDescription(Utils.Markup.codestring(String(error)))

		return context.editOrReply({ embed, reference: true })
	}

	onTypeError(
		context: Command.Context,
		_: ParsedArgsFinished,
		errors: Command.ParsedErrors
	) {
		const embed = new Utils.Embed()
		embed.setTitle('⚠ Command Argument Error')

		const store: { [key: string]: string } = {}

		const description: Array<string> = ['Invalid Arguments' + '\n']
		for (let key in errors) {
			const message = errors[key].message
			if (message in store) {
				description.push(
					`**${key}**: Same error as **${store[message]}**`
				)
			} else {
				description.push(`**${key}**: ${message}`)
			}
			store[message] = key
		}

		embed.setDescription(description.join('\n'))
		return context.editOrReply({ embed, reference: true })
	}
}
