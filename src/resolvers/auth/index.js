
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("./../../utils");

const signup = async (parent, args, context) => {
    const codeValues = await context.prisma.codeValues();
    let mobileNumberCodeValueId;
    codeValues.filter(entity => {
        if(entity.genericId === 1001){
            mobileNumberCodeValueId = entity.id;
        }
    })
    console.log("--== signup args --== ", args, codeValues, mobileNumberCodeValueId);
    const userBean = {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      password: args.password,
      orgUnitId: {
        create: {
          registeredName: args.regOrgUnitName,
          displayName: args.displayOrgUnitName,
          address: args.orgUnitAddress
        }
      },
      isOrgUnitPrimaryContact: true,
      contactId: {
        create: [
          {
            detailTypeId: {
              connect: {
                id: mobileNumberCodeValueId
              }
            },
            value: args.mobileNumber
          }
        ]
      }
    };
    const user = await context.prisma.createUser(userBean);
    const token = jwt.sign({ userId: user.id }, APP_SECRET);
    return {
      token,
      user
    };
  }

const signIn = async (parent, args, context, info) => {
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
    signIn
}