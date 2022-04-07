import commons from './Lib/commons.js'
import {
	InteractionCommandClient,
	ClusterClient,
	CommandClient
} from 'detritus-client'
import { join } from 'path'
import { config } from './Lib/config.js'
import { cache, prefix } from './Lib/constants.js'
import { Prisma } from './db.js'
import './Lib/console.js'

const TemplateCluster = new ClusterClient(config.token, {
	gateway: {
		intents: 1545
	},
	cache
})

const { __dirname } = commons(import.meta.url)

;(async () => {
	await TemplateCluster.run()
	const shardsText = `Shards #(${TemplateCluster.shards
		.map((shard) => shard.shardId)
		.join(', ')})`
	console.log(`${shardsText} - Loaded`)

	{
		const TemplateCommandClient = new CommandClient(TemplateCluster, {
			activateOnEdits: true,
			mentionsEnabled: true,
			prefix: prefix,
			cache
		})
		await TemplateCommandClient.addMultipleIn(
			join(__dirname, './Commands/prefixed')
		)
		await TemplateCommandClient.run()

		console.log(
			`Prefixed Commands - Loaded (§c${TemplateCommandClient.commands.length}§r)`
		)
	}

	{
		const TemplateInteractionClient = new InteractionCommandClient(
			TemplateCluster,
			{
				cache,
				checkCommands: true
			}
		)
		await TemplateInteractionClient.addMultipleIn(
			join(__dirname, './Commands/interaction')
		)
		await TemplateInteractionClient.run()

		console.log(
			`Interaction Commands - Loaded (§c${TemplateInteractionClient.commands.size}§r)`
		)
	}

	console.log(
		`Commands - Imported${
			process.env.NODE_ENV === 'development'
				? ' in development servers'
				: ''
		}`
	)

	const PrismaLog = Date.now()
	await Prisma.$connect()
	console.log(
		`Prisma - Connected (§c${(Date.now() - PrismaLog) / 1000} secs§r)`
	)
})()
