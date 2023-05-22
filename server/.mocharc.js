"use strict";

module.exports = {
  require: "./register.js",
  reporter: "spec",
  exclude: process.env.NODE_ENV === "ci" ? ["test/http.test.ts"] : [],
};
