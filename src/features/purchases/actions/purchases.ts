'use server';

import { canRefundPurchases } from '../permissions/purchases';
import { getCurrentUser } from '../../../services/clerk';
import { stripeServerClient } from '../../../services/stripe/stripeServer';
import { db } from '../../../drizzle/db';
import { updatePurchase } from '../db/purchase';
import { revokeUserCourseAccess } from '../../courses/db/userCourseAccess';

export async function refundPurchase(purchaseId: string) {
  const user = await getCurrentUser();
  if (!canRefundPurchases(user)) {
    return {
      error: true,
      message: 'You do not have permission to refund a purchase',
    };
  }

  const data = await db.transaction(async trx => {
    const refundedPurchase = await updatePurchase(
      purchaseId,
      { refundedAt: new Date() },
      trx
    );

    const session = await stripeServerClient.checkout.sessions.retrieve(
      refundedPurchase.stripeSessionId
    );

    if (session.payment_intent == null) {
      trx.rollback();

      return {
        error: true,
        message: 'Failed to refund purchase',
      };
    }

    try {
      await stripeServerClient.refunds.create({
        reason: 'requested_by_customer',
        payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id,
      });

      await revokeUserCourseAccess(refundedPurchase, trx);
    } catch {
      trx.rollback();

      return {
        error: true,
        message: 'Failed to refund purchase',
      };
    }
  });

  return data ?? {
    error: false,
    message: 'Successfully refunded purchase',
  };
}