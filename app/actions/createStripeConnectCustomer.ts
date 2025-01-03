'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { stripe } from '@/lib/stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function createStripeConnectCustomer() {
  try {
    const [user, currUser] = await Promise.all([auth(), currentUser()]);
    const { userId } = user;

    if (!userId || !currUser) {
      throw new Error('Not authenticated');
    }

    // Check if user already has a connect account
    const existingStripeConnectId = await convex.query(
      api.users.getUsersStripeConnectId,
      {
        userId,
      }
    );

    if (existingStripeConnectId) {
      return { account: existingStripeConnectId };
    }

    // Create new connect account
    const account = await stripe.accounts.create({
      country: 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      controller: {
        fees: {
          payer: 'application',
        },
        losses: {
          payments: 'application',
        },
        stripe_dashboard: {
          type: 'express',
        },
      },
    });

    // Update user with stripe connect id
    await convex.mutation(api.users.updateOrCreateUserStripeConnectId, {
      userId,
      stripeConnectId: account.id,
    });

    return { account: account.id };
  } catch (err) {
    throw err;
  }
}
