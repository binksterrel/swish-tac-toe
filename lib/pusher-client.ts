import type PusherClient from "pusher-js"

let _client: PusherClient | null = null

export function getPusherClient(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error("getPusherClient() must be called in browser context")
  }
  if (!_client) {
    // Dynamic require avoids module-level instantiation during SSR prerender
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PusherJS = require("pusher-js") as typeof PusherClient
    _client = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
  }
  return _client
}
