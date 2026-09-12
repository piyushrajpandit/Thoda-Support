"use client"
import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { fetchuser, fetchpayments, initiate, sendMessageToCreator } from '@/actions/useractions'
import { useSearchParams, useRouter } from 'next/navigation'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentPage = ({ username }) => {
    const [paymentform, setPaymentform] = useState({ name: "", message: "", amount: "" })
    const [currentUser, setcurrentUser] = useState({})
    const [payments, setPayments] = useState([])
    const searchParams = useSearchParams()
    const router = useRouter()

    // Chat modal state
    const [showChatModal, setShowChatModal] = useState(false)
    const [chatForm, setChatForm] = useState({ name: "", email: "", message: "" })
    const [sendingMsg, setSendingMsg] = useState(false)

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

    const handleChatChange = (e) => {
        setChatForm({ ...chatForm, [e.target.name]: e.target.value })
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!chatForm.name || !chatForm.message) {
            toast.error("Please enter your name and message")
            return
        }
        setSendingMsg(true)
        try {
            const res = await sendMessageToCreator({
                to_user: username,
                from_name: chatForm.name,
                from_email: chatForm.email,
                message: chatForm.message
            })

            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success(`Message sent to @${username}!`)
                setChatForm({ name: "", email: "", message: "" })
                setShowChatModal(false)
            }
        } catch (err) {
            toast.error(err.message || "Failed to send message")
        } finally {
            setSendingMsg(false)
        }
    }

    const getData = async () => {
        let u = await fetchuser(username)
        if (u) setcurrentUser(u)
        let dbpayments = await fetchpayments(username)
        setPayments(dbpayments || [])
    }

    const pay = async (amountInPaise) => {
        try {
            let a = await initiate(amountInPaise, username, paymentform)
            let orderId = a.id
            let razorpayKey = a.key_id || currentUser?.razorpayid || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_demoKey"

            var options = {
                "key": razorpayKey,
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

            <div className="info flex justify-center items-center my-24 mb-32 flex-col gap-2 px-4">
                <div className='font-bold text-xl flex items-center gap-2'>
                    @{username}
                </div>

                {currentUser?.bio && (
                    <p className='text-center text-gray-300 max-w-lg text-sm italic my-1'>
                        &quot;{currentUser.bio}&quot;
                    </p>
                )}

                <div className='flex gap-3 my-1 items-center flex-wrap justify-center'>
                    {currentUser?.twitter && (
                        <a href={currentUser.twitter} target="_blank" rel="noopener noreferrer" title="Twitter / X" className="bg-slate-800 hover:bg-blue-600 p-2 rounded-full text-white transition">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                    )}
                    {currentUser?.youtube && (
                        <a href={currentUser.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" className="bg-slate-800 hover:bg-red-600 p-2 rounded-full text-white transition">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                    )}
                    {currentUser?.linkedin && (
                        <a href={currentUser.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="bg-slate-800 hover:bg-blue-700 p-2 rounded-full text-white transition">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.262-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                    )}
                    {currentUser?.portfolio && (
                        <a href={currentUser.portfolio} target="_blank" rel="noopener noreferrer" title="Portfolio / Website" className="bg-slate-800 hover:bg-emerald-600 p-2 rounded-full text-white transition">
                            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </a>
                    )}

                    {/* Chat Button */}
                    <button
                        onClick={() => setShowChatModal(true)}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition shadow-md"
                    >
                        💬 Chat with @{username}
                    </button>
                </div>

                <div className='text-slate-400'>
                    Let&apos;s help {username} get a chai!
                </div>
                <div className='text-slate-400 font-medium'>
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
                            <div className="bg-blue-950/60 border border-blue-500/40 text-blue-200 px-3 py-2 rounded-lg mb-4 text-xs text-center">
                                ℹ️ <strong>Demo Payment Mode:</strong> Creator hasn&apos;t set custom keys yet. Payments will use platform default Razorpay keys.
                            </div>
                        )}

                        <div className='flex gap-2 flex-col'>
                            <div>
                                <input onChange={handleChange} value={paymentform.name} name='name' type="text" className='w-full p-3 rounded-lg bg-slate-800 text-white placeholder-slate-400' placeholder='Enter Name' />
                            </div>
                            <input onChange={handleChange} value={paymentform.message} name='message' type="text" className='w-full p-3 rounded-lg bg-slate-800 text-white placeholder-slate-400' placeholder='Enter Message' />
                            <input onChange={handleChange} value={paymentform.amount} name="amount" type="text" className='w-full p-3 rounded-lg bg-slate-800 text-white placeholder-slate-400' placeholder='Enter Amount in ₹' />

                            <button
                                onClick={() => pay(Number.parseInt(paymentform.amount) * 100)}
                                type="button"
                                className="text-white bg-gradient-to-br from-purple-900 to-blue-900 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!paymentform.name || paymentform.name.length < 3 || !paymentform.message || paymentform.message.length < 4 || !paymentform.amount || Number.isNaN(Number(paymentform.amount)) || Number(paymentform.amount) <= 0}
                            >
                                Pay
                            </button>
                        </div>

                        <div className='flex flex-col md:flex-row gap-2 mt-5'>
                            <button className='bg-slate-800 p-3 rounded-lg hover:bg-slate-700' onClick={() => pay(1000)}>Pay ₹10</button>
                            <button className='bg-slate-800 p-3 rounded-lg hover:bg-slate-700' onClick={() => pay(2000)}>Pay ₹20</button>
                            <button className='bg-slate-800 p-3 rounded-lg hover:bg-slate-700' onClick={() => pay(3000)}>Pay ₹30</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Chat Widget Button (Bottom-Right Corner) */}
            <button
                onClick={() => setShowChatModal(true)}
                className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 border border-blue-400/30"
                title={`Send message to @${username}`}
            >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                </svg>
                <span className="text-xs font-semibold hidden md:inline">Message @{username}</span>
            </button>

            {/* Chat Modal */}
            {showChatModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowChatModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold"
                        >
                            ✕
                        </button>
                        
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                            <img
                                src={currentUser?.profilepic || "/man.webp"}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover border border-blue-500"
                            />
                            <div>
                                <h3 className="font-bold text-white text-base">Send Message to @{username}</h3>
                                <p className="text-gray-400 text-xs">Direct private note to creator</p>
                            </div>
                        </div>

                        <form onSubmit={handleSendMessage} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Your Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={chatForm.name}
                                    onChange={handleChatChange}
                                    placeholder="Enter your name"
                                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Your Email or Social Handle (Optional)</label>
                                <input
                                    type="text"
                                    name="email"
                                    value={chatForm.email}
                                    onChange={handleChatChange}
                                    placeholder="you@example.com or @twitter"
                                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Message *</label>
                                <textarea
                                    name="message"
                                    value={chatForm.message}
                                    onChange={handleChatChange}
                                    rows={4}
                                    placeholder={`Write your message for @${username}...`}
                                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sendingMsg}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-md transition disabled:opacity-50 text-xs font-semibold"
                            >
                                {sendingMsg ? "Sending Message..." : "Send Message 🚀"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default PaymentPage