import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'

export async function POST(req: Request) {
  const { priceId } = await req.json()
  const origin = req.headers.get('origin')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  try {
    const { data: checkout, error } = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID as string,
      priceId || (process.env.LEMONSQUEEZY_VARIANT_ID as string),
      {
        checkoutData: {
          custom: {
            userId: user.id,
          },
        },
        productOptions: {
          redirectUrl: `${origin}/dashboard/billing`,
          receiptButtonText: 'Go to Billing',
          receiptLinkUrl: `${origin}/dashboard/billing`,
        },
      }
    )

    if (error) {
      console.error('Lemon Squeezy error:', error)
      return new NextResponse('Error creating checkout', { status: 500 })
    }

    return NextResponse.json(checkout)
  } catch (error) {
    console.error('Error creating Lemon Squeezy checkout:', error)
    return new NextResponse('Error creating checkout', { status: 500 })
  }
}
