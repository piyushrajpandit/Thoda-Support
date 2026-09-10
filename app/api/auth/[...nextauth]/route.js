import NextAuth from 'next-auth'
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import connectDb from '@/db/connectDb';
import User from '@/models/User';

export const authoptions = NextAuth({
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Phone/Password",
      credentials: {
        identifier: { label: "Phone or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Please enter Phone / Username and Password");
        }
        await connectDb();
        const input = credentials.identifier.trim();
        let decoded = decodeURIComponent(input);
        let regex = new RegExp(`^${decoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i');

        const dbUser = await User.findOne({
          $or: [
            { phone: input },
            { username: input },
            { username: decoded },
            { username: regex },
            { email: input }
          ]
        });

        if (!dbUser || !dbUser.password) {
          throw new Error("No account found with this Phone Number or Username. Please sign up first.");
        }

        const isValid = await bcrypt.compare(credentials.password, dbUser.password);
        if (!isValid) {
          throw new Error("Incorrect Password. Please try again.");
        }

        return {
          id: dbUser._id.toString(),
          name: dbUser.username,
          email: dbUser.email || `${dbUser.username}@thodasupport.local`
        };
      }
    }),
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
    async jwt({ token, user }) {
      if (user) {
        token.username = user.name;
        token.email = user.email;
      }
      return token;
    },
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
    async session({ session, token }) {
      try {
        await connectDb()
        const targetEmail = token?.email || session?.user?.email;
        const targetUsername = token?.username || session?.user?.name;

        if (targetEmail || targetUsername) {
          const dbUser = await User.findOne({
            $or: [
              ...(targetEmail ? [{ email: targetEmail }] : []),
              ...(targetUsername ? [{ username: targetUsername }] : [])
            ]
          })
          if (dbUser) {
            session.user.name = dbUser.username
            session.user.email = dbUser.email
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