import PaymentPage from '@/components/PaymentPage'
import React from 'react'
import { notFound } from "next/navigation"
import connectDB from '@/db/connectDb'
import User from '@/models/User'


const Username = async ({ params }) => {
    //if user name is not found show 404 page
    const checkuser = async (username) =>{
        await connectDB()
        let u = await User.findOne({username: params.username})

    if(!u){
        return notFound()
    }
  }
    await checkuser()
      
      return (
        <>
      <PaymentPage username={params.username}/>
      
    </>
  )
}


export default Username

// or dynamic metadata
export async function generateMetadata({ params }) {
  return {
    title: `Supprot ${params.username} - Get Me A Capital`,   

  }

}