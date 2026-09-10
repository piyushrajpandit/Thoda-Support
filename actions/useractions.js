"use server"

import Razorpay from "razorpay"
import Payment from "@/models/Payment"
import connectDb from "@/db/connectDb"
import User from "@/models/User"

export const initiate = async (amount, to_username, paymentform) => {
    await connectDb()
    let decoded = decodeURIComponent(to_username)
    let clean = decoded.trim()
    let regex = new RegExp(`^${clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i')
    let user = await User.findOne({
        $or: [
            { username: to_username },
            { username: decoded },
            { username: clean },
            { username: regex }
        ]
    })
    if (!user || !user.razorpayid || !user.razorpaysecret) {
        throw new Error("User has not setup Razorpay credentials properly.")
    }

    const instance = new Razorpay({ key_id: user.razorpayid, key_secret: user.razorpaysecret })

    let options = {
        amount: Number.parseInt(amount), // amount in paise
        currency: "INR",
    }

    let x = await instance.orders.create(options)

    // Create a pending payment record in rupees (amount / 100)
    await Payment.create({
        oid: x.id,
        amount: Number.parseInt(amount) / 100,
        to_user: user.username,
        name: paymentform.name,
        message: paymentform.message
    })

    return JSON.parse(JSON.stringify(x))
}

export const fetchuser = async (username) => {
    await connectDb()
    let decoded = decodeURIComponent(username)
    let clean = decoded.trim()
    let regex = new RegExp(`^${clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i')
    let u = await User.findOne({
        $or: [
            { username: username },
            { username: decoded },
            { username: clean },
            { username: regex }
        ]
    })
    if (!u) return null
    let user = JSON.parse(JSON.stringify(u.toObject()))
    return user
}

export const fetchpayments = async (username) => {
    await connectDb()
    let decoded = decodeURIComponent(username)
    let clean = decoded.trim()
    let regex = new RegExp(`^${clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i')
    let p = await Payment.find({
        to_user: { $in: [username, decoded, clean, regex] },
        done: true
    }).sort({ amount: -1 }).limit(10).lean()
    return JSON.parse(JSON.stringify(p))
}

export const updateProfile = async (data, oldusername) => {
    await connectDb()
    let ndata = typeof data.entries === 'function' ? Object.fromEntries(data) : data
    let decodedOld = decodeURIComponent(oldusername).trim()
    let regexOld = new RegExp(`^${decodedOld.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i')

    const searchCriteria = {
        $or: [
            { username: oldusername },
            { username: decodedOld },
            { username: regexOld },
            ...(ndata.email ? [{ email: ndata.email }] : [])
        ]
    }

    // If username is being changed, check availability
    if (oldusername !== ndata.username && decodedOld !== ndata.username?.trim()) {
        let u = await User.findOne({ username: ndata.username?.trim() })
        if (u && u.email !== ndata.email) {
            return { error: "Username already exists" }
        }
        await User.updateOne(searchCriteria, ndata)
        await Payment.updateMany({ to_user: { $in: [oldusername, decodedOld, regexOld] } }, { to_user: ndata.username })
    } else {
        await User.updateOne(searchCriteria, ndata)
    }

    return { success: true }
}