'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { api } from '@/lib/api';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function StripePayment({ amount }: { amount: number }) {
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        const fetchIntent = async () => {
            try {
                const response = await api.post('/payment/create-intent', { amount });
                setClientSecret(response.data.clientSecret);
            } catch (err) {
                console.error("Failed to create payment intent", err);
            }
        };
        fetchIntent();
    }, [amount]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#10b981',
        },
    };

    const options: StripeElementsOptions = {
        clientSecret,
        appearance,
    };

    return (
        <div className="Stripe">
            {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm clientSecret={clientSecret} />
                </Elements>
            )}
        </div>
    );
}
