export interface StripeGateway {
  createCharge(args: { amountCents: number; customerRef: string; description: string }): Promise<{ id: string }>
}

let _gateway: StripeGateway | null = null
export function stripe(): StripeGateway {
  if (!_gateway) {
    _gateway = {
      async createCharge(args) {
        const key = process.env.STRIPE_SECRET_KEY
        if (!key) throw new Error('STRIPE_SECRET_KEY not set')
        const { default: Stripe } = await import('stripe')
        const client = new Stripe(key)
        const pi = await client.paymentIntents.create({
          amount: args.amountCents,
          currency: 'usd',
          description: args.description,
          confirm: false,
          metadata: { customerRef: args.customerRef },
        })
        return { id: pi.id }
      },
    }
  }
  return _gateway
}
