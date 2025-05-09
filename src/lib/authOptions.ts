// src/lib/authOptions.ts
import { NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../db/db"; // Adjust path if needed
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [ // "@ts-expect-error"
    // Add other providers like Google here if you still need them
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, /*req */) {
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
    signIn: '/login', // Specify your custom login page path
    // error: '/auth/error', // Optional: custom error page
    // signOut: '/logout', // Optional: custom signout page
  },
  callbacks: { // "@ts-expect-error"
    // You might need callbacks to customize the session or JWT token
    async jwt({ token, user }) {
      // When authorize returns a user, add its id to the token
      if (user) {
        token.id = user.id;
        // Add any other user properties you want in the token
        // token.role = user.role;
      }
      return token;
    },
    async session({ session, token, /*req */ }) {
      // Add properties from the token (like user.id) to the session object
      if (token && session.user) {
        // IMPORTANT: Make sure the 'id' property exists on your session.user type
        // You might need to augment the default NextAuth types
        (session.user as { id: string }).id = token.id as string;


        // session.user.role = token.role; // Add other properties if needed
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in your .env file
  debug: process.env.NODE_ENV === "development", // Optional: Enable debug logs in development
};

