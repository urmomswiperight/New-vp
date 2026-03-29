import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

if (!process.env.LEMONSQUEEZY_API_KEY) {
  throw new Error('LEMONSQUEEZY_API_KEY is not set')
}

lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY,
})
