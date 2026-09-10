"use client"
import React, { useEffect, useState } from 'react'
import { useSession, signIn } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { registerUser, createCreatorDirect } from '@/actions/useractions'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Login = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Modes: 'direct' (details only, no auth/OTP needed), 'login' (phone/pass login), 'signup' (phone/pass signup)
  const [mode, setMode] = useState('direct');
  const [loading, setLoading] = useState(false);

  // Forms
  const [directForm, setDirectForm] = useState({
    username: '',
    name: '',
    email: '',
    bio: '',
    profilepic: '',
    coverpic: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    portfolio: '',
    razorpayid: '',
    razorpaysecret: ''
  });

  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [signupForm, setSignupForm] = useState({ phone: '', username: '', name: '', password: '' });

  useEffect(() => {
    document.title = "Create Account or Login - Thoda Support";
    if (session) router.push("/dashboard");
  }, [session, router]);

  const handleDirectChange = (e) => {
    setDirectForm({ ...directForm, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };

  // Direct Account Creation (No Auth / Password / OTP needed)
  const handleDirectSubmit = async (e) => {
    e.preventDefault();
    if (!directForm.username || !directForm.name) {
      toast.error("Please provide at least a Username and Name");
      return;
    }
    setLoading(true);
    try {
      const res = await createCreatorDirect(directForm);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Account @${res.username} created successfully! Redirecting to creator page...`);
        setTimeout(() => {
          router.push(`/${res.username}`);
        }, 1200);
      }
    } catch (err) {
      toast.error(err.message || "Failed to create creator account");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) {
      toast.error("Please fill in both Phone/Username and Password");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        identifier: loginForm.identifier,
        password: loginForm.password,
        redirect: false
      });

      if (res?.error) {
        toast.error(res.error || "Login failed. Check your credentials.");
      } else {
        toast.success("Logged in successfully!");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupForm.phone && !signupForm.username) {
      toast.error("Please enter a Phone Number or Username");
      return;
    }
    if (!signupForm.password || signupForm.password.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(signupForm);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Account created successfully!");
        const loginRes = await signIn("credentials", {
          identifier: signupForm.phone || signupForm.username,
          password: signupForm.password,
          redirect: false
        });
        if (!loginRes?.error) {
          router.push("/dashboard");
        } else {
          setMode('login');
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

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
        theme="dark"
        transition={Bounce}
      />
      <div className='text-white py-10 container mx-auto px-4 min-h-[85vh] flex flex-col justify-center items-center'>
        <h1 className='text-center font-bold text-3xl mb-2'>
          {mode === 'direct' ? 'Create Creator Account' : mode === 'login' ? 'Welcome Back!' : 'Sign Up with Password'}
        </h1>
        <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
          {mode === 'direct'
            ? 'No passwords or OTP required! Just fill in your creator details to launch your live page instantly.'
            : 'Access your creator dashboard & payments.'}
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full max-w-xl p-6">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-700 mb-6 text-xs md:text-sm">
            <button
              onClick={() => setMode('direct')}
              className={`flex-1 pb-3 text-center font-semibold transition border-b-2 ${
                mode === 'direct'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              ✨ Details Only (No Auth)
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 pb-3 text-center font-semibold transition border-b-2 ${
                mode === 'login'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              📱 Phone / Password Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 pb-3 text-center font-semibold transition border-b-2 ${
                mode === 'signup'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              🔐 Register Account
            </button>
          </div>

          {/* Mode 1: Details Only (No Auth, No OTP, No Password) */}
          {mode === 'direct' && (
            <form onSubmit={handleDirectSubmit} className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 p-3 rounded-lg text-xs mb-3">
                ⚡ <strong>Quick Creator Creation:</strong> Simply enter your username and details below to create your creator profile directly.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Username * <span className="text-gray-500">(Profile URL)</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={directForm.username}
                    onChange={handleDirectChange}
                    placeholder="e.g. sumitkumar"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={directForm.name}
                    onChange={handleDirectChange}
                    placeholder="e.g. Sumit Kumar"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Short Bio
                </label>
                <textarea
                  name="bio"
                  value={directForm.bio}
                  onChange={handleDirectChange}
                  rows={2}
                  placeholder="Tell supporters what you do..."
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Profile Picture Image URL
                  </label>
                  <input
                    type="text"
                    name="profilepic"
                    value={directForm.profilepic}
                    onChange={handleDirectChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Cover Banner Image URL
                  </label>
                  <input
                    type="text"
                    name="coverpic"
                    value={directForm.coverpic}
                    onChange={handleDirectChange}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-emerald-400 mb-2">Social Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="twitter"
                    value={directForm.twitter}
                    onChange={handleDirectChange}
                    placeholder="Twitter/X URL"
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs"
                  />
                  <input
                    type="text"
                    name="youtube"
                    value={directForm.youtube}
                    onChange={handleDirectChange}
                    placeholder="YouTube URL"
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs"
                  />
                  <input
                    type="text"
                    name="linkedin"
                    value={directForm.linkedin}
                    onChange={handleDirectChange}
                    placeholder="LinkedIn URL"
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs"
                  />
                  <input
                    type="text"
                    name="portfolio"
                    value={directForm.portfolio}
                    onChange={handleDirectChange}
                    placeholder="Portfolio URL"
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-emerald-400 mb-2">Payment Setup (Razorpay)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="razorpayid"
                    value={directForm.razorpayid}
                    onChange={handleDirectChange}
                    placeholder="Razorpay Key ID"
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs"
                  />
                  <input
                    type="text"
                    name="razorpaysecret"
                    value={directForm.razorpaysecret}
                    onChange={handleDirectChange}
                    placeholder="Razorpay Key Secret"
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-lg shadow-lg transition disabled:opacity-50 text-sm mt-4"
              >
                {loading ? "Creating Account..." : "Create Account & View Profile"}
              </button>
            </form>
          )}

          {/* Mode 2: Phone / Password Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Phone Number or Username
                </label>
                <input
                  type="text"
                  name="identifier"
                  value={loginForm.identifier}
                  onChange={handleLoginChange}
                  placeholder="e.g. 9876543210 or creator123"
                  className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-md transition disabled:opacity-50 text-sm"
              >
                {loading ? "Logging in..." : "Login to Dashboard"}
              </button>
            </form>
          )}

          {/* Mode 3: Register Account with Password */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={signupForm.phone}
                  onChange={handleSignupChange}
                  placeholder="e.g. 9876543210"
                  className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={signupForm.username}
                  onChange={handleSignupChange}
                  placeholder="e.g. piyushraj"
                  className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                  placeholder="At least 4 characters"
                  className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg shadow-md transition disabled:opacity-50 text-sm"
              >
                {loading ? "Creating Account..." : "Create Account with Password"}
              </button>
            </form>
          )}

          {/* Social Logins Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-3 text-gray-400">Or continue with OAuth</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => signIn("google")}
              type="button"
              className="flex items-center justify-center w-full bg-slate-50 text-black border border-gray-300 rounded-lg shadow-md py-2 px-4 text-xs font-medium hover:bg-gray-200 focus:outline-none transition"
            >
              <svg className="h-4 w-4 mr-2" viewBox="-0.5 0 48 48">
                <g fill="none" fillRule="evenodd">
                  <path d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24" fill="#FBBC05" />
                  <path d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333" fill="#EB4335" />
                  <path d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667" fill="#34A853" />
                  <path d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24" fill="#4285F4" />
                </g>
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={() => signIn("github")}
              type="button"
              className="flex items-center justify-center w-full bg-slate-800 text-white border border-slate-700 rounded-lg shadow-md py-2 px-4 text-xs font-medium hover:bg-slate-700 focus:outline-none transition"
            >
              <svg className="h-4 w-4 mr-2 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
