const { GraphQLServer } = require("graphql-yoga");
const { prisma } = require("./generated/prisma-client");
require("dotenv").config();
// const {signup, login,} = require("./resolvers/auth/Mutation")
const {signup, signIn} = require("./resolvers/auth")

const resolvers = {
  Query: {
    feed: (parent, args, context) => {
      return context.prisma.posts({ where: { published: true } });
    },
    drafts: (parent, args, context) => {
      return context.prisma.posts({ where: { published: false } });
    },
    post: (parent, { id }, context) => {
      return context.prisma.post({ id });
    },
    codeByName: async (parent, args, context) => {
      console.log('--== I am CodeByName ==--')
      const codes = await context.prisma.codes({ where: { name: args.name } });
      const code = codes[0];
      const codeValues = await context.prisma.codeValues({
        where: { codeId: code }
      });
      code.codeValueId = [...codeValues];
      return code;
    }
  },
  Mutation: {
    createDraft(parent, { title, content }, context) {
      return context.prisma.createPost({
        title,
        content
      });
    },
    deletePost(parent, { id }, context) {
      return context.prisma.deletePost({ id });
    },
    publish(parent, { id }, context) {
      return context.prisma.updatePost({
        where: { id },
        data: { published: true }
      });
    },
    signup,
    signIn
  }
};

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: request => {
    return {
      ...request,
      prisma
    };
  }
});

const envDetails = {
  host:
    process.env.NODE_TYPE === "DEVELOPMENT"
      ? process.env.DEV_HOST
      : process.env.PROD_HOST,
  port: process.env.PORT
}

server.start(
  envDetails,
  () => {
    console.log(
      `--== GraphQL API Started at http://${envDetails.host}:${envDetails.port}`
    );
  }
);
