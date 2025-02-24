import { env } from '../../../data/env/client';
import { stripeServerClient } from '../stripeServer';

export async function getClientSessionSecret(
  product: {
    priceInDollars: number;
    name: string;
    id: string;
    imageUrl: string;
    description: string;
  }, user: {
    email: string;
    id: string;
  }) {
  const session = await stripeServerClient.checkout.sessions.create({
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            // handle both absolute/relative urls
            images: [new URL(product.imageUrl, env.NEXT_PUBLIC_SERVER_URL).href],
            description: product.description,
          },
          // convert to penny for stripe
          unit_amount: product.priceInDollars * 100,
        },
      },
    ],
    ui_mode: 'embedded',
    mode: 'payment',
    return_url: `${env.NEXT_PUBLIC_SERVER_URL}/api/webhooks/stripe?stripeSessionId={CHECKOUT_SESSION_ID}`,
    customer_email: user.email,
    payment_intent_data: {
      receipt_email: user.email,
    },
    metadata: {
      productId: product.id,
      userId: user.id
    }
  });

  if (session.client_secret == null) {
    throw new Error('Could not get client secret');
  }

  return session.client_secret;
};