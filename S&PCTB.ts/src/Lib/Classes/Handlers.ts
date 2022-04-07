import { ClusterClient } from 'detritus-client'
import { readdir } from 'fs/promises'
import { join } from 'path'

export class Handlers {
	private client: ClusterClient

	constructor(client: ClusterClient) {
		this.client = client
	}

	private async getFiles(dir: string): Promise<string[]> {
		const FilesRaw = await readdir(dir, { withFileTypes: true })
		const Names = []

		for (const Folder of FilesRaw) {
			if (Folder.isDirectory()) {
				const Files = await this.getFiles(join(dir, Folder.name))
				for (const File of Files) Names.push(File)
			} else Names.push(join(dir, Folder.name))
		}

		return Names
	}

	async events(dir: string): Promise<number | void> {
		let i = 0
		const Files = await this.getFiles(dir)

		if (!Files.length)
			return console.warn(`The is no events on the folder: §b${dir}§r`)

		for (const File of Files) {
			if (!File.endsWith('.js')) continue

			const Event = await import(`file://${File}`)
			const EventName = Event.name

			i++
			this.client?.on(EventName, Event.run.bind(null, this.client))
		}

		return i
	}
}
