declare module 'react-stripe-checkout' {
  import * as React from 'react';

  interface StripeCheckoutProps {
    token: (token: any) => void;
    stripeKey: string;
    children?: React.ReactNode;
  }

  export default class StripeCheckout extends React.Component<StripeCheckoutProps> {}
}
