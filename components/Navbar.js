"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Navbar = () => {
  const { data: session, status } = useSession()
  const [showdropdown, setShowdropdown] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowdropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/') // Redirect to home after sign out
  }

  // Show loading state while session is being checked
  if (status === "loading") {
    return (
      <nav className='bg-gray-900 shadow-xl shadow-white text-white flex justify-between items-center px-4 md:h-16'>
        <div className="logo font-bold text-lg flex justify-center items-center">
        
          <span className='text-xl md:text-base my-3 md:my-0 '>Thoda Support</span>  
          <img src="tea.webp" width={44} alt="" />
        </div>
        <div>Loading...</div>
      </nav>
    )
  }

  return (
    <nav className='bg-gray-900 shadow-xl shadow-white text-white flex justify-between items-center px-4 md:h-16 gap-2'>

      <Link className="logo font-bold text-lg flex justify-center items-center" href={"/"}>
      
        <span className='text-xl md:text-base my-3 md:my-0'>Thoda Support  heheh</span>
          <img className='invertImg ' src="tea.webp" width={44} alt="" />
      </Link>

      <div className='relative flex justify-center items-center gap-4' ref={dropdownRef}>
        {session ? (
          <>
            {/* Dropdown Button */}
            <button 
              onClick={() => setShowdropdown(!showdropdown)}
              id="dropdownDefaultButton" 
              className="text-white mx-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" 
              type="button"
            >
              Welcome {session.user?.name || 'User'} 
              <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div 
              id="dropdown" 
              className={`z-10 ${showdropdown ? "block" : "hidden"} absolute left-[15px] top-12 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
            >
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                <li>
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => setShowdropdown(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href={`/${session.user?.name || 'user'}`} 
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => setShowdropdown(false)}
                  >
                    Your Page
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      handleSignOut()
                      setShowdropdown(false)
                    }} 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>

            {/* Single Logout Button (removed the duplicate) */}
            <button 
              className='text-white w-fit bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2' 
              onClick={handleSignOut}
            >
              Logout
            </button>
          </>
        ) : (
          /* Show login button when not authenticated */
          <Link href={"/login"}>
            <button className='text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2'>
              Login
            </button>
          </Link>
        )}
        
        {/* Always show Piyush button */}
        <Link href="/piyush06raj04">
          <button className='text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2'>
            Piyush
          </button>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar