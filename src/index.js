const { GraphQLServer } = require('graphql-yoga')
const { prisma } = require('./generated/prisma-client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('./utils')
// const {signup, login,} = require("./resolvers/auth/Mutation")

const resolvers = {
  Query: {
    feed: (parent, args, context) => {
      return context.prisma.posts({ where: { published: true } })
    },
    drafts: (parent, args, context) => {
      return context.prisma.posts({ where: { published: false } })
    },
    post: (parent, { id }, context) => {
      return context.prisma.post({ id })
    },
    codeByName: async (parent, args, context) => {
      const codes = await context.prisma.codes({where :{name: args.name}});
      const code = codes[0];
      const codeValues = await context.prisma.codeValues({where: {codeId: code}});
      code.codeValueId = [...codeValues];
      return code;
    }
  },
  Mutation: {
    createDraft(parent, { title, content }, context) {
      return context.prisma.createPost({
        title,
        content,
      })
    },
    deletePost(parent, { id }, context) {
      return context.prisma.deletePost({ id })
    },
    publish(parent, { id }, context) {
      return context.prisma.updatePost({
        where: { id },
        data: { published: true },
      })
    },
    async signup(parent, args, context) {
      console.log('--== signup args --== ', args)
      const userBean = {
          firstName: args.firstName
          ,lastName: args.lastName
          ,email: args.email
          ,password: args.password
          ,orgUnitId: {
            create: {
              registeredName: args.regOrgUnitName
              ,displayName: args.displayOrgUnitName
              ,address: args.orgUnitAddress
            }
          }
          ,isOrgUnitPrimaryContact: true
          ,contactId: {
            create: [
              {detailTypeId: {
                connect: {
                  id: 'ck21y6tce0098081511p3r1v2'
                }
              }
              ,value: args.mobileNumber}
            ]
          }
      }
      const user = await context.prisma.createUser(userBean)
      const token = jwt.sign({ userId: user.id }, APP_SECRET)
      return {
        token,
        user,
      }
    }
  },
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: request => {
    return {
      ...request,
      prisma,
    }
  },
})

server.start(() => console.log('Server is running on http://localhost:4000'))
