const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../../utils')

async function signup(parent, args, context, info) {
    console.log('--== signup args --== ', args)
    /**
     * 
     * 
     * # Write your query or mutation here
      mutation {
        signup( regOrgUnitName:"VRL Logistics PVT Limited"
              ,displayOrgUnitName:"VRL Travels"
              ,orgUnitAddress:"VRL Chennai"
              ,firstName:"veerareddy"
              ,lastName:"obulareddy"
              ,email:"veerareddy.obula@exp.com"
              ,password:"veera@168"
              ,mobileNumber: "9440949111") {
          token
        }
      }
     * 
     * 
     */
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
  
  async function login(parent, args, context, info) {
    console.log('--== Login Mutation --== ', args);
    const user = await context.prisma.user({email: args.email})
    if (!user) {
      throw new Error('No such user found')
    }
    console.log('--== Login Mutation --== ', user)
    if(args.password !== user.password){
        const valid = await bcrypt.compare(args.password, user.password)
        if (!valid) {
          throw new Error('Invalid password')
        }
    }
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
    return {
      token,
      user,
    }
  }
  
  module.exports = {
    signup,
    login,
  }