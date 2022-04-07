import { KufaConsole } from 'kufa'

declare global {
	interface Console {
		//eslint-disable-next-line
		on(event: string, handler: () => void): any
	}

	namespace NodeJS {
		interface ProcessEnv {
			TOKEN_DEV: string
			TOKEN: string
			DEVS: string
			DEV_SERVERS: string
		}

		interface Global {
			Console: KufaConsole
		}
	}
}
