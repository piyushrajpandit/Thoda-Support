"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { fetchuser, updateProfile, fetchCreatorMessages, markMessageAsRead } from '@/actions/useractions'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [form, setform] = useState({
        name: "",
        email: "",
        username: "",
        profilepic: "",
        coverpic: "",
        bio: "",
        twitter: "",
        youtube: "",
        linkedin: "",
        portfolio: "",
        razorpayid: "",
        razorpaysecret: ""
    })

    const [messages, setMessages] = useState([])
    const [loadingMsgs, setLoadingMsgs] = useState(false)
    const [activeTab, setActiveTab] = useState('settings') // 'settings' or 'inbox'

    const getData = useCallback(async () => {
        if (!session?.user?.name) return;
        let u = await fetchuser(session.user.name)
        if (u) {
            setform(u)
        }
        loadMessages(session.user.name)
    }, [session?.user?.name])

    const loadMessages = async (uname) => {
        setLoadingMsgs(true)
        try {
            let msgs = await fetchCreatorMessages(uname)
            setMessages(msgs || [])
        } catch (err) {
            console.error('Failed to load messages:', err)
        } finally {
            setLoadingMsgs(false)
        }
    }

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push('/login')
        } else {
            getData()
        }
    }, [session, status, router, getData])

    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let maxDim = fieldName === 'coverpic' ? 1200 : 400
                let width = img.width
                let height = img.height

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width)
                        width = maxDim
                    } else {
                        width = Math.round((width * maxDim) / height)
                        height = maxDim
                    }
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
                setform((prev) => ({ ...prev, [fieldName]: dataUrl }))
            }
            img.src = event.target.result
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (formData) => {
        if (!session?.user?.name) return;
        let res = await updateProfile({ ...form, ...Object.fromEntries(formData) }, session.user.name)
        if (res?.error) {
            toast.error(res.error, {
                position: "top-right",
                autoClose: 5000,
                theme: "light",
                transition: Bounce,
            });
        } else {
            toast.success('Profile Updated', {
                position: "top-right",
                autoClose: 5000,
                theme: "light",
                transition: Bounce,
            });
            if (form.username !== session.user.name) {
                router.push(`/${form.username}`);
            }
        }
    }

    const handleMarkRead = async (msgId) => {
        await markMessageAsRead(msgId)
        setMessages(messages.map(m => m._id === msgId ? { ...m, read: true } : m))
    }

    if (status === "loading") {
        return <div className="text-white text-center py-20">Loading dashboard...</div>;
    }

    const unreadCount = messages.filter(m => !m.read).length

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
            <div className='container mx-auto py-5 px-4 max-w-4xl'>
                <h1 className='text-center my-4 text-3xl font-bold text-white'>Creator Dashboard</h1>

                {/* Navigation Switcher Tabs */}
                <div className="flex border-b border-gray-700 mb-6 justify-center">
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`py-3 px-6 text-sm font-semibold border-b-2 transition ${
                            activeTab === 'settings'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        ⚙️ Profile & Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('inbox')}
                        className={`py-3 px-6 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
                            activeTab === 'inbox'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        💬 Supporter Messages
                        {unreadCount > 0 && (
                            <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Tab 1: Profile & Settings */}
                {activeTab === 'settings' && (
                    <form className="max-w-2xl mx-auto" action={handleSubmit}>
                        <div className='my-2'>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <input value={form.name || ""} onChange={handleChange} type="text" name='name' id="name" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                        </div>
                        <div className="my-2">
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                            <input value={form.email || ""} onChange={handleChange} type="email" name='email' id="email" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                        </div>
                        <div className='my-2'>
                            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                            <input value={form.username || ""} onChange={handleChange} type="text" name='username' id="username" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                        </div>
                        <div className="my-2">
                            <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Short Bio</label>
                            <textarea value={form.bio || ""} onChange={handleChange} rows={2} name='bio' id="bio" placeholder="Tell your supporters about yourself..." className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                        </div>

                        {/* Profile Picture Upload & URL */}
                        <div className="my-4">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Profile Picture</label>
                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                                {form.profilepic && (
                                    <img src={form.profilepic} alt="Profile Preview" className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 flex-shrink-0" />
                                )}
                                <div className="flex-1 w-full space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'profilepic')}
                                        className="block w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                    />
                                    <input
                                        value={form.profilepic || ""}
                                        onChange={handleChange}
                                        type="text"
                                        name='profilepic'
                                        id="profilepic"
                                        placeholder="Or paste Profile Picture Image URL..."
                                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cover Picture Upload & URL */}
                        <div className="my-4">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cover Banner Picture</label>
                            <div className="flex flex-col gap-2">
                                {form.coverpic && (
                                    <img src={form.coverpic} alt="Cover Preview" className="w-full h-24 rounded-lg object-cover border border-gray-700" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'coverpic')}
                                    className="block w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                />
                                <input
                                    value={form.coverpic || ""}
                                    onChange={handleChange}
                                    type="text"
                                    name='coverpic'
                                    id="coverpic"
                                    placeholder="Or paste Cover Banner Image URL..."
                                    className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="my-4 pt-3 border-t border-gray-700">
                            <h3 className="text-md font-semibold mb-2 text-blue-400">Social Links & Web Presence</h3>
                            
                            <div className="my-2">
                                <label htmlFor="twitter" className="block mb-1 text-xs font-medium text-gray-300">Twitter / X URL</label>
                                <input value={form.twitter || ""} onChange={handleChange} type="text" name='twitter' id="twitter" placeholder="https://x.com/yourhandle" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                            </div>
                            <div className="my-2">
                                <label htmlFor="youtube" className="block mb-1 text-xs font-medium text-gray-300">YouTube Channel URL</label>
                                <input value={form.youtube || ""} onChange={handleChange} type="text" name='youtube' id="youtube" placeholder="https://youtube.com/@yourchannel" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                            </div>
                            <div className="my-2">
                                <label htmlFor="linkedin" className="block mb-1 text-xs font-medium text-gray-300">LinkedIn Profile URL</label>
                                <input value={form.linkedin || ""} onChange={handleChange} type="text" name='linkedin' id="linkedin" placeholder="https://linkedin.com/in/yourprofile" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                            </div>
                            <div className="my-2">
                                <label htmlFor="portfolio" className="block mb-1 text-xs font-medium text-gray-300">Portfolio / Website URL</label>
                                <input value={form.portfolio || ""} onChange={handleChange} type="text" name='portfolio' id="portfolio" placeholder="https://yourwebsite.com" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                            </div>
                        </div>

                        <div className="my-4 pt-3 border-t border-gray-700">
                            <h3 className="text-md font-semibold mb-2 text-blue-400">Payment Integration</h3>
                            <div className="my-2">
                                <label htmlFor="razorpayid" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Razorpay Key ID</label>
                                <input value={form.razorpayid || ""} onChange={handleChange} type="text" name='razorpayid' id="razorpayid" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                            </div>
                            <div className="my-2">
                                <label htmlFor="razorpaysecret" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Razorpay Key Secret</label>
                                <input value={form.razorpaysecret || ""} onChange={handleChange} type="text" name='razorpaysecret' id="razorpaysecret" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                            </div>
                        </div>

                        <div className="my-6">
                            <button type="submit" className="block w-full p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-blue-500 focus:ring-4 focus:outline-none dark:focus:ring-blue-800 font-medium text-sm">Save Profile</button>
                        </div>
                    </form>
                )}

                {/* Tab 2: Messages Inbox */}
                {activeTab === 'inbox' && (
                    <div className="max-w-2xl mx-auto space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Supporter Messages ({messages.length})</h2>
                            <button
                                onClick={() => loadMessages(session?.user?.name)}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                            >
                                🔄 Refresh Inbox
                            </button>
                        </div>

                        {loadingMsgs && <div className="text-center py-10 text-gray-400">Loading messages...</div>}

                        {!loadingMsgs && messages.length === 0 && (
                            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-gray-400">
                                💬 No direct messages received yet. Your supporters can message you from your public creator profile!
                            </div>
                        )}

                        {!loadingMsgs && messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`p-4 rounded-xl border transition ${
                                    msg.read
                                        ? 'bg-slate-900/60 border-slate-800 text-gray-300'
                                        : 'bg-slate-900 border-blue-500/50 shadow-lg text-white'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-sm text-blue-400 flex items-center gap-2">
                                            {msg.from_name}
                                            {!msg.read && (
                                                <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">New</span>
                                            )}
                                        </div>
                                        {msg.from_email && (
                                            <div className="text-xs text-gray-400">{msg.from_email}</div>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-gray-500">
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <p className="text-sm bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 my-2 whitespace-pre-wrap">
                                    {msg.message}
                                </p>

                                <div className="flex gap-2 justify-end mt-3">
                                    {msg.from_email && (
                                        <a
                                            href={`mailto:${msg.from_email}?subject=Reply%20from%20${session?.user?.name}`}
                                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md font-medium transition"
                                        >
                                            ✉️ Reply
                                        </a>
                                    )}
                                    {!msg.read && (
                                        <button
                                            onClick={() => handleMarkRead(msg._id)}
                                            className="text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 px-3 py-1 rounded-md transition"
                                        >
                                            ✓ Mark as Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default Dashboard