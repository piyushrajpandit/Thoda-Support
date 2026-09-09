import PaymentPage from '@/components/PaymentPage'
import React, { Suspense } from 'react'
import { notFound } from "next/navigation"
import connectDB from '@/db/connectDb'
import User from '@/models/User'

const Username = async ({ params }) => {
    const resolvedParams = await params;
    const rawUsername = resolvedParams.username;
    const decodedUsername = decodeURIComponent(rawUsername);
    const cleanUsername = decodedUsername.trim();
    const regexPattern = new RegExp(`^${cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i');

    await connectDB();
    let u = await User.findOne({
        $or: [
            { username: rawUsername },
            { username: decodedUsername },
            { username: cleanUsername },
            { username: regexPattern }
        ]
    });

    if (!u) {
        return notFound();
    }

    return (
        <Suspense fallback={<div className="text-white text-center py-20">Loading...</div>}>
            <PaymentPage username={u.username} />
        </Suspense>
    );
};

export default Username;

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const rawUsername = resolvedParams.username;
    const decodedUsername = decodeURIComponent(rawUsername);
    return {
        title: `Support ${decodedUsername.trim()} - Thoda Support`,
    };
}