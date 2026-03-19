import NextAuth from 'next-auth'
import GitHubProvider from "next-auth/providers/github";
import connectDb from '@/db/connectDb';
import User from '@/models/User';

export const authoptions = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider == "github") {
        await connectDb()
        const currentUser = await User.findOne({ email: user.email })
        if (!currentUser) {
          await User.create({
            email: user.email,
            username: user.email.split("@")[0],
          })
        }
        return true
      }
    },
    async session({ session }) {
      const dbUser = await User.findOne({ email: session.user.email })
      if (dbUser) {
        session.user.name = dbUser.username
      }
      return session
    },
  }
})

export { authoptions as GET, authoptions as POST }