import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { stripeServerClient } from '../../../../services/stripe/stripeServer';
import { eq } from 'drizzle-orm';
import { ProductTable, UserTable } from '../../../../drizzle/schema';
import { db } from '../../../../drizzle/db';
import { addUserCourseAccess } from '../../../../features/courses/db/userCourseAccess';
import { insertPurchase } from '../../../../features/purchases/db/purchase';
import { env } from '../../../../data/env/server';

export async function GET(req: NextRequest) {
  const stripeSessionId = req.nextUrl.searchParams.get('stripeSessionId');

  if (!stripeSessionId) {
    redirect('/products/purchase-failure');
  }

  let redirectUrl: string;

  try {
    const checkoutSession = await stripeServerClient.checkout.sessions
      .retrieve(stripeSessionId, {
        expand: ['line_items'],
      });
    const productId = await processStripeCheckout(checkoutSession);

    redirectUrl = `/products/${productId}/purchase/success`;
  } catch {
    redirectUrl = `/products/purchase-failure`;
  }

  // handle next.js bug https://github.com/vercel/next.js/issues/74757
  return NextResponse.redirect(new URL(redirectUrl, req.url));
}

export async function POST(req: NextRequest) {
  const event = stripeServerClient.webhooks.constructEvent(
    await req.text(),
    req.headers.get('Stripe-Signature') as string,
    env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      try {
        await processStripeCheckout(event.data.object as Stripe.Checkout.Session);
      } catch {
        return new Response(null, {
          status: 500,
        });
      }
      break;

    default:
      break;
  }
}

async function processStripeCheckout(checkoutSession: Stripe.Checkout.Session) {
  const userId = checkoutSession.metadata?.userId;
  const productId = checkoutSession.metadata?.productId;

  if (!userId || !productId) {
    throw new Error('Missing metadata - userId or productId');
  }

  const [product, user] = await Promise.all([
    getProduct(productId),
    getUser(userId),
  ]);

  if (product == null) {
    throw new Error('Product not found');
  }

  if (user == null) {
    throw new Error('User not found');
  }

  const courseIds = product.courseProducts.map(cp => cp.courseId);
  db.transaction(async trx => {
    try {
      await addUserCourseAccess({ userId: user.id, courseIds }, trx);
      await insertPurchase({
        stripeSessionId: checkoutSession.id,
        pricePaidInCents: checkoutSession.amount_total || product.priceInDollars * 100,
        productDetails: product,
        userId: user.id,
        productId,
      }, trx);
    } catch (error) {
      trx.rollback();
      throw error;
    }
  });

  return productId;
}

function getProduct(id: string) {
  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      imageUrl: true,
      description: true,
      priceInDollars: true,
    },
    where: eq(ProductTable.id, id),
    with: {
      courseProducts: {
        columns: {
          courseId: true,
        }
      }
    }
  });
}

function getUser(id: string) {
  return db.query.UserTable.findFirst({
    columns: {
      id: true,
      email: true,
    },
    where: eq(UserTable.id, id)
  });
} 