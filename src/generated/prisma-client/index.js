"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Post",
    embedded: false
  },
  {
    name: "Code",
    embedded: false
  },
  {
    name: "CodeValue",
    embedded: false
  },
  {
    name: "OrgUnit",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "ContactDetail",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `http://localhost:4466`
});
exports.prisma = new exports.Prisma();
