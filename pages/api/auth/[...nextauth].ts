import NextAuth from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { type: "text" },
        password: { type: "password" },
      },
      authorize: (credentials: any) => {
        console.log("authorize", credentials);
        // database look up
        if (
          credentials.username === "test" &&
          credentials.password === "test"
        ) {
          return {
            id: 2,
            name: "John",
          };
        }

        // login failed
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user, account }) => {
      // first time jwt callback is run, user object is available
      if (user && account) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      console.log("session", token);
      if (token) {
        session.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.SECRET,
  jwt: {
    secret: process.env.SECRET,
    // encryption: true,
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === 'development',
});
