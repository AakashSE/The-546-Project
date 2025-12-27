import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendOrderEmail } from '../../../utils/emailService';

export async function POST(request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            cartItems, // Passed from frontend to save order details
            userId,
            totalAmount,
            shippingAddress
        } = await request.json();

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Initialize Supabase Admin Client (Service Role for Bypass RLS)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // USE ADMIN MKEY
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 3. Save Order to Database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId, // Can be null for guest if table allows
                total_amount: totalAmount,
                status: 'paid', // Trusted status because verified signature
                stripe_session_id: razorpay_order_id, // Reusing column or add new 'provider_order_id'
                shipping_address: shippingAddress
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 4. Save Order Items
        const orderItems = cartItems.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            quantity: 1, // Logic change if qty supported later
            price_at_purchase: item.price_value || 0, // Need numeric value
            selected_color: item.selectedColor?.colorName,
            selected_size: item.size,
            image_url: item.selectedColor?.images?.front || item.defaultImage
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 5. Send Confirmation Email (Async / Non-blocking)
        const runEmailAsync = async () => {
            try {
                const { data: { user: authUser }, error: userError } = await supabase.auth.admin.getUserById(userId);
                if (authUser && authUser.email) {
                    await sendOrderEmail(order, orderItems, authUser.email);
                }
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
            }
        };
        runEmailAsync(); // Do not await

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
