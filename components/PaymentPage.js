"use client"
import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { fetchuser, fetchpayments, initiate } from '@/actions/useractions'
import { useSearchParams, useRouter } from 'next/navigation'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentPage = ({ username }) => {
    const [paymentform, setPaymentform] = useState({ name: "", message: "", amount: "" })
    const [currentUser, setcurrentUser] = useState({})
    const [payments, setPayments] = useState([])
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        getData()
    }, [username])

    useEffect(() => {
        if (searchParams.get("paymentdone") === "true") {
            toast.success('Thanks for your donation!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
                transition: Bounce,
            });
            router.replace(`/${username}`, { scroll: false })
        }
    }, [searchParams, router, username])

    const handleChange = (e) => {
        setPaymentform({ ...paymentform, [e.target.name]: e.target.value })
    }

    const getData = async () => {
        let u = await fetchuser(username)
        if (u) setcurrentUser(u)
        let dbpayments = await fetchpayments(username)
        setPayments(dbpayments || [])
    }

    const pay = async (amountInPaise) => {
        if (!currentUser?.razorpayid) {
            toast.error("This creator has not configured their Razorpay credentials yet.");
            return;
        }

        try {
            let a = await initiate(amountInPaise, username, paymentform)
            let orderId = a.id
            var options = {
                "key": currentUser.razorpayid,
                "amount": amountInPaise,
                "currency": "INR",
                "name": "Thoda Support",
                "description": "Donation for " + username,
                "order_id": orderId,
                "callback_url": `${process.env.NEXT_PUBLIC_URL || window.location.origin}/api/razorpay`,
                "prefill": {
                    "name": paymentform.name || "Supporter",
                },
                "theme": {
                    "color": "#3399cc"
                }
            }

            if (typeof window !== "undefined" && window.Razorpay) {
                var rzp1 = new window.Razorpay(options);
                rzp1.open();
            } else {
                toast.error("Razorpay SDK failed to load. Please refresh and try again.");
            }
        } catch (err) {
            toast.error(err.message || "Failed to initiate payment");
        }
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>

            <div className='cover w-full bg-red-50 relative'>
                <img
                    className='object-cover w-full h-48 md:h-[350px] shadow-blue-700 shadow-sm'
                    src={currentUser?.coverpic || "/cover.jpeg"}
                    alt="cover"
                />
                <div className='absolute -bottom-20 right-[33%] md:right-[46%] border-white overflow-hidden border-2 rounded-full size-36 bg-slate-800'>
                    <img
                        className='rounded-full object-cover size-36'
                        width={128}
                        height={128}
                        src={currentUser?.profilepic || "/man.webp"}
                        alt="profile"
                    />
                </div>
            </div>

            <div className="info flex justify-center items-center my-24 mb-32 flex-col gap-2">
                <div className='font-bold text-lg'>
                    @{username}
                </div>
                <div className='text-slate-400'>
                    Let&apos;s help {username} get a chai!
                </div>
                <div className='text-slate-400'>
                    {payments.length} Payments . ₹{payments.reduce((a, b) => a + (b.amount || 0), 0)} raised
                </div>

                <div className="payment flex gap-3 w-[80%] mt-11 flex-col md:flex-row">
                    <div className="supporters w-full md:w-1/2 bg-slate-900 rounded-lg text-white px-2 md:p-10">
                        <h2 className='text-2xl font-bold my-5'> Top 10 Supporters</h2>
                        <ul className='mx-5 text-lg'>
                            {payments.length === 0 && <li>No payments yet</li>}
                            {payments.map((p, i) => {
                                return (
                                    <li key={p._id || i} className='my-4 flex gap-2 items-center'>
                                        <img width={33} height={33} className="rounded-full" src="/man.webp" alt="user avatar" />
                                        <span>
                                            {p.name} donated <span className='font-bold'>₹{p.amount}</span> with a message &quot;{p.message}&quot;
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    <div className="makePayment w-full md:w-1/2 bg-slate-900 rounded-lg text-white px-2 md:p-10">
                        <h2 className='text-2xl font-bold my-5'>Make a Payment</h2>
                        
                        {!currentUser?.razorpayid && (
                            <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg mb-4 text-sm text-center">
                                ⚠️ <strong>Notice:</strong> @{username} has not provided their payment details (Razorpay Key ID & Secret) yet. Payments are currently unavailable for this creator.
                            </div>
                        )}

                        <div className='flex gap-2 flex-col'>
                            <div>
                                <input onChange={handleChange} value={paymentform.name} name='name' type="text" className='w-full p-3 rounded-lg bg-slate-800' placeholder='Enter Name' disabled={!currentUser?.razorpayid} />
                            </div>
                            <input onChange={handleChange} value={paymentform.message} name='message' type="text" className='w-full p-3 rounded-lg bg-slate-800' placeholder='Enter Message' disabled={!currentUser?.razorpayid} />
                            <input onChange={handleChange} value={paymentform.amount} name="amount" type="text" className='w-full p-3 rounded-lg bg-slate-800' placeholder='Enter Amount in ₹' disabled={!currentUser?.razorpayid} />

                            <button
                                onClick={() => pay(Number.parseInt(paymentform.amount) * 100)}
                                type="button"
                                className="text-white bg-gradient-to-br from-purple-900 to-blue-900 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!currentUser?.razorpayid || !paymentform.name || paymentform.name.length < 3 || !paymentform.message || paymentform.message.length < 4 || !paymentform.amount || Number.isNaN(Number(paymentform.amount)) || Number(paymentform.amount) <= 0}
                            >
                                Pay
                            </button>
                        </div>

                        <div className='flex flex-col md:flex-row gap-2 mt-5'>
                            <button className='bg-slate-800 p-3 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed' onClick={() => pay(1000)} disabled={!currentUser?.razorpayid}>Pay ₹10</button>
                            <button className='bg-slate-800 p-3 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed' onClick={() => pay(2000)} disabled={!currentUser?.razorpayid}>Pay ₹20</button>
                            <button className='bg-slate-800 p-3 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed' onClick={() => pay(3000)} disabled={!currentUser?.razorpayid}>Pay ₹30</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PaymentPage