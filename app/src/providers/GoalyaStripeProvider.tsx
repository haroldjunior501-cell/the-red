import React, { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

/** Passthrough — Stripe désactivé (crash Expo Go / modules natifs). */
export function GoalyaStripeProvider({ children }: Props) {
  return <>{children}</>;
}
