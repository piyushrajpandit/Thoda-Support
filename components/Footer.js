import React from 'react'

const Footer = () => {
  return (
    <footer className='bg-black text-white flex flex-col sm:flex-row items-center justify-between px-6 h-auto sm:h-16 py-3'>
      <p className="text-sm text-center sm:text-left">
        Get Me Capital &copy; 2024. All rights reserved.
      </p>

      <div className="flex gap-3 mt-2 sm:mt-0">
        <a
          href="https://www.linkedin.com/public-profile/settings?trk=d_flagship3_profile_self_view_public_profile"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all"
        >
          Follow me on LinkedIn
        </a>
        <a
          href="https://github.com/piyushrajpandit"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm transition-all"
        >
          Follow me on GitHub
        </a>
      </div>
    </footer>
  )
}

export default Footer
