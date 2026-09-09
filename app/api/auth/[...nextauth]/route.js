import NextAuth from 'next-auth'
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import connectDb from '@/db/connectDb';
import User from '@/models/User';

export const authoptions = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || ""
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          await connectDb()
          if (!user?.email) {
            return false;
          }
          const currentUser = await User.findOne({ email: user.email })
          if (!currentUser) {
            let baseUsername = user.email.split("@")[0]
            let username = baseUsername
            let count = 1
            while (await User.findOne({ username })) {
              username = `${baseUsername}${count}`
              count++
            }
            await User.create({
              email: user.email,
              username: username,
              name: user.name || username,
              profilepic: user.image || "",
            })
          }
          return true
        } catch (error) {
          console.error('SignIn error:', error?.message || error)
          return false
        }
      }
      return true
    },
    async session({ session }) {
      try {
        await connectDb()
        if (session?.user?.email) {
          const dbUser = await User.findOne({ email: session.user.email })
          if (dbUser) {
            session.user.name = dbUser.username
          }
        }
        return session
      } catch (error) {
        console.error('Session error:', error?.message || error)
        return session
      }
    },
  }
})

export { authoptions as GET, authoptions as POST }