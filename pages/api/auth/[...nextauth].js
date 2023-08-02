import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session) {
        session.user.username = session.user.email.split('@')[0];
      }
      return session;
    },
  },
}

export default NextAuth(authOptions)