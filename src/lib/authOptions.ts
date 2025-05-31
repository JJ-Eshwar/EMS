
import { NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../db/db"; 
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Optional: You can request additional scopes or customize profile data
      // authorization: { params: { scope: "openid email profile https://www.googleapis.com/auth/userinfo.profile" } },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null; // Indicate failure
        }

        // 1. Find user by email in your database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.error("No user found with email:", credentials.email);
          return null; // User not found
        }

        // --- Optional: Check if email is verified ---
        // if (!user.isvarified) { // Assuming you have an 'isvarified' field
        //   console.error("User email not verified:", credentials.email);
        //   // You might want to throw a specific error here or return null
        //   // throw new Error("Email not verified");
        //   return null;
        // }
        // --- End Optional Check ---


        // 2. Verify password
        // Ensure user.password is not null before comparing
        if (!user.password) {
            console.error("User found but has no password set:", credentials.email);
            return null; // Cannot authenticate if password isn't set
        }
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password // Make sure 'password' is the name of your hashed password field in the User model
        );

        if (!isValidPassword) {
          console.error("Invalid password for user:", credentials.email);
          return null; // Password doesn't match
        }

        // 3. Return user object if everything is okay
        //    This object is what gets saved in the JWT/session.
        //    Make sure it includes fields you need, like id, email, name, role etc.
        //    It MUST include at least 'id' and 'email' for the adapter/session to work correctly.
        console.log("User authorized successfully:", user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name, // Add other fields as needed

          // Add other properties you want in the session/token
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT for session strategy is common
  },
  pages: {
    signIn: '/onboarding', // Specify your custom login page path
    // error: '/auth/error', // Optional: custom error page
    // signOut: '/logout', // Optional: custom signout page
  },
  callbacks: {
    // You might need callbacks to customize the session or JWT token
    async jwt({ token, user, account }) { // account is available here
      // When authorize returns a user, or if it's a sign-in with an OAuth provider
      if (account && user) { // This condition is true for OAuth sign-ins
        token.id = user.id;
        // You can add other user properties from the OAuth provider if needed
        // For example, if you want to store the access token from Google:
        // token.accessToken = account.access_token;
      } else if (user) { // This condition is true for credentials provider
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token}) {
      // Add properties from the token (like user.id) to the session object
      if (token && session.user) {
        // IMPORTANT: Make sure the 'id' property exists on your session.user type
        // You might need to augment the default NextAuth types
        (session.user as { id: string }).id = token.id as string;

        // session.user.id = token.id;
        // session.user.role = token.role;
        // session.user.role = token.role; // Add other properties if needed
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in your .env file
  debug: process.env.NODE_ENV === "development", // Optional: Enable debug logs in development
};
