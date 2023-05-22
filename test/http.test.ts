import fs from "fs";
import bcrypt from "bcrypt";
import chai, { expect } from "chai";
import chaiArrays from "chai-arrays";
import chaiDatetime from "chai-datetime";
import faker from "faker";
import jwt from "jsonwebtoken";
import { Sequelize } from "sequelize";
import request from "supertest";
import { OAuth2Server } from "../src/server";
import "dotenv/config";

chai.use(chaiDatetime);
chai.use(chaiArrays);

describe("HTTP API", () => {
  let server: OAuth2Server;
  let db: Sequelize;

  before(() => {
    server = new OAuth2Server({});
    db = server.database.sequelize;
  });

  after(async () => {
    await db.close();
  });

  describe("POST /api/auth/login", () => {
    describe("400", () => {
      it("when 'email' is missing", (done) => {
        request(server.app)
          .post("/api/auth/login")
          .send({ password: faker.internet.password() })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data must have required property 'email'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'email' is empty", (done) => {
        request(server.app)
          .post("/api/auth/login")
          .send({ email: "", password: faker.internet.password() })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/email must NOT have fewer than 1 characters",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'email' does not have the correct format", (done) => {
        request(server.app)
          .post("/api/auth/login")
          .send({
            email: faker.datatype.string(),
            password: faker.internet.password(),
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/email must match format 'email'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'password' is missing", (done) => {
        request(server.app)
          .post("/api/auth/login")
          .send({ email: faker.internet.email() })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data must have required property 'password'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'password' is empty", (done) => {
        request(server.app)
          .post("/api/auth/login")
          .send({ email: faker.internet.email(), password: "" })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/password must NOT have fewer than 1 characters",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });
    });

    describe("401", () => {
      const id = faker.datatype.uuid();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const name = faker.name.findName();
      const hashedPassword = bcrypt.hashSync(password, 10);
      const createdAt = new Date().toISOString();

      before(async () => {
        const query = `INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES ('${id}', '${email}', '${hashedPassword}', '${name}', '${createdAt}', '${createdAt}')`;
        await db.query(query);
      });

      after(async () => {
        const query = `DELETE FROM users WHERE id = '${id}'`;
        await db.query(query);
      });

      it("when user does not exist", (done) => {
        request(server.app)
          .post("/api/auth/login")
          .send({ email: faker.internet.email(), password })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(401)
          .expect({
            message: "Invalid email or password",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });

      it("when password is invalid", (done) => {
        request(server.app)
          .post("/api/auth/login")
          .send({ email, password: faker.internet.password() })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(401)
          .expect({
            message: "Invalid email or password",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });
    });

    describe("200", () => {
      const id = faker.datatype.uuid();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const name = faker.name.findName();
      const hashedPassword = bcrypt.hashSync(password, 10);
      const createdAt = new Date().toISOString();

      before(async () => {
        const query = `INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES ('${id}', '${email}', '${hashedPassword}', '${name}', '${createdAt}', '${createdAt}')`;
        await db.query(query);
      });

      after(async () => {
        const query = `DELETE FROM users WHERE id = '${id}'`;
        await db.query(query);
      });

      it("when credentials are valid", (done) => {
        request(server.app)
          .post("/api/auth/login")
          .send({ email, password })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .expect((res) =>
            expect(res.body)
              .to.be.an("object")
              .and.to.have.property("message")
              .and.to.be.a("string")
              .and.to.equal(`Logged in as ${id}`),
          )
          .end(done);
      });
    });
  });

  describe("POST /api/users", () => {
    describe("400", () => {
      it("when 'email' is missing", (done) => {
        request(server.app)
          .post("/api/users")
          .send({
            password: faker.internet.password(),
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data must have required property 'email'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'email' is empty", (done) => {
        request(server.app)
          .post("/api/users")
          .send({
            email: "",
            password: faker.internet.password(),
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/email must NOT have fewer than 1 characters",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'email' does not have the correct format", (done) => {
        request(server.app)
          .post("/api/users")
          .send({
            email: faker.datatype.string(),
            password: faker.internet.password(),
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/email must match format 'email'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'password' is missing", (done) => {
        request(server.app)
          .post("/api/users")
          .send({ email: faker.internet.email(), name: faker.name.findName() })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data must have required property 'password'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'password' is empty", (done) => {
        request(server.app)
          .post("/api/users")
          .send({
            email: faker.internet.email(),
            password: "",
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/password must NOT have fewer than 1 characters",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'name' is missing", (done) => {
        request(server.app)
          .post("/api/users")
          .send({
            email: faker.internet.email(),
            password: faker.internet.password(),
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data must have required property 'name'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'name' is empty", (done) => {
        request(server.app)
          .post("/api/users")
          .send({
            email: faker.internet.email(),
            password: faker.internet.password(),
            name: "",
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/name must NOT have fewer than 1 characters",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });
    });

    describe("409", () => {
      const id = faker.datatype.uuid();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const name = faker.name.findName();
      const hashedPassword = bcrypt.hashSync(password, 10);
      const createdAt = new Date().toISOString();

      before(async () => {
        const query = `INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES ('${id}', '${email}', '${hashedPassword}', '${name}', '${createdAt}', '${createdAt}')`;
        await db.query(query);
      });

      after(async () => {
        const query = `DELETE FROM users WHERE id = '${id}'`;
        await db.query(query);
      });

      it("when 'email' already exists", (done) => {
        request(server.app)
          .post("/api/users")
          .send({
            email,
            password: faker.internet.password(),
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(409)
          .expect({
            message: "email must be unique",
            name: "Conflict",
            status: 409,
          })
          .end(done);
      });

      it("when 'name' already exists", (done) => {
        request(server.app)
          .post("/api/users")
          .send({
            email: faker.internet.email(),
            password: faker.internet.password(),
            name,
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(409)
          .expect({
            message: "name must be unique",
            name: "Conflict",
            status: 409,
          })
          .end(done);
      });
    });

    describe("201", () => {
      it("when user is valid", (done) => {
        const email = faker.internet.email();
        const name = faker.name.findName();

        request(server.app)
          .post("/api/users")
          .send({
            email,
            password: faker.internet.password(),
            name,
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect("Location", /users/)
          .expect(201)
          .end(async (err, res) => {
            if (err) return done(err);

            expect(res.body).to.have.keys(
              "id",
              "email",
              "name",
              "createdAt",
              "updatedAt",
            );
            expect(res.body).to.not.have.key("password");
            expect(res.body.id).to.be.a("string");
            expect(res.body.email).to.be.a("string").and.to.equal(email);
            expect(res.body.name).to.be.a("string").and.to.equal(name);
            expect(res.body.createdAt).to.be.a("string");
            expect(res.body.updatedAt).to.be.a("string");

            const query = `DELETE FROM users WHERE id = '${res.body.id}'`;
            await db.query(query);

            done();
          });
      });
    });
  });

  describe("GET /api/users/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})", () => {
    const id = faker.datatype.uuid();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.findName();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();

    before(async () => {
      const query = `INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES ('${id}', '${email}', '${hashedPassword}', '${name}', '${createdAt}', '${createdAt}')`;
      await db.query(query);
    });

    after(async () => {
      const query = `DELETE FROM users WHERE id = '${id}'`;
      await db.query(query);
    });

    describe("404", () => {
      const id = faker.datatype.uuid();

      it("when user does not exist", (done) => {
        request(server.app)
          .get(`/api/users/${id}`)
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            message: `User not found: '${id}'`,
            name: "NotFound",
            status: 404,
          })
          .end(done);
      });
    });

    describe("200", () => {
      it("when user does exist", (done) => {
        request(server.app)
          .get(`/api/users/${id}`)
          .expect("Content-Type", /json/)
          .expect(200)
          .expect({
            id,
            email,
            name,
            createdAt,
            updatedAt: createdAt,
          })
          .end(done);
      });
    });
  });

  describe("PATCH /api/users/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})", () => {
    const id = faker.datatype.uuid();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.findName();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();
    const payload = { id, email };
    const token = jwt.sign(payload, fs.readFileSync("/tmp/test.key"), {
      algorithm: "RS256",
    });

    before(async () => {
      const query = `INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES ('${id}', '${email}', '${hashedPassword}', '${name}', '${createdAt}', '${createdAt}')`;
      await db.query(query);
    });

    after(async () => {
      const query = `DELETE FROM users WHERE id = '${id}'`;
      await db.query(query);
    });

    describe("400", () => {
      it("when 'email' is empty", (done) => {
        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            email: "",
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/email must NOT have fewer than 1 characters",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'email' does not have the correct format", (done) => {
        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            email: faker.datatype.string(),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/email must match format 'email'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'password' is empty", (done) => {
        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            password: "",
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/password must NOT have fewer than 1 characters",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'name' is empty", (done) => {
        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            name: "",
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/name must NOT have fewer than 1 characters",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });
    });

    describe("401", () => {
      it("when authentication is missing", (done) => {
        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(401)
          .expect("WWW-Authenticate", "Bearer missing_token")
          .expect({
            message: "Check 'WWW-Authenticate' header",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });

      it("when authentication scheme is unknown", (done) => {
        const scheme = faker.datatype.string();

        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `${scheme} ${token}`)
          .expect("Content-Type", /json/)
          .expect(401)
          .expect("WWW-Authenticate", "Bearer unknown_scheme")
          .expect({
            message: "Check 'WWW-Authenticate' header",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });

      it("when authentication token is invalid", (done) => {
        const token = faker.datatype.string();

        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(401)
          .expect("WWW-Authenticate", /^Bearer invalid_token/)
          .expect({
            message: "Check 'WWW-Authenticate' header",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });
    });

    describe("403", () => {
      const payload = {
        id: faker.datatype.uuid(),
        email: faker.internet.email(),
      };
      const token = jwt.sign(payload, fs.readFileSync("/tmp/test.key"), {
        algorithm: "RS256",
      });

      it("when updating another user", (done) => {
        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(403)
          .expect({
            message: "Not allowed to perform this action",
            name: "Forbidden",
            status: 403,
          })
          .end(done);
      });
    });

    describe("404", () => {
      const id = faker.datatype.uuid();
      const payload = {
        id,
        email: faker.internet.email(),
      };
      const token = jwt.sign(payload, fs.readFileSync("/tmp/test.key"), {
        algorithm: "RS256",
      });

      it("when user does not exist", (done) => {
        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            message: `User not found: '${id}'`,
            name: "NotFound",
            status: 404,
          })
          .end(done);
      });
    });

    describe("409", () => {
      const alreadyExistingId = faker.datatype.uuid();
      const alreadyExistingEmail = faker.internet.email();
      const alreadyExistingName = faker.name.findName();

      before(async () => {
        const query = `INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES ('${alreadyExistingId}', '${alreadyExistingEmail}', '${hashedPassword}', '${alreadyExistingName}', '${createdAt}', '${createdAt}')`;
        await db.query(query);
      });

      after(async () => {
        const query = `DELETE FROM users WHERE id = '${alreadyExistingId}'`;
        await db.query(query);
      });

      it("when 'email' already exists", (done) => {
        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            email: alreadyExistingEmail,
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(409)
          .expect({
            message: "email must be unique",
            name: "Conflict",
            status: 409,
          })
          .end(done);
      });

      it("when 'name' already exists", (done) => {
        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            name: alreadyExistingName,
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(409)
          .expect({
            message: "name must be unique",
            name: "Conflict",
            status: 409,
          })
          .end(done);
      });
    });

    describe("200", () => {
      const newEmail = faker.internet.email();
      const newName = faker.name.findName();

      it("when user does exist", (done) => {
        request(server.app)
          .patch(`/api/users/${id}`)
          .send({
            name: newName,
            email: newEmail,
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(async (err, res) => {
            if (err) return done(err);

            expect(res.body).to.have.keys(
              "id",
              "email",
              "name",
              "createdAt",
              "updatedAt",
            );
            expect(res.body).to.not.have.key("password");
            expect(res.body.id).to.be.a("string").and.to.equal(id);
            expect(res.body.email).to.be.a("string").and.to.equal(newEmail);
            expect(res.body.name).to.be.a("string").and.to.equal(newName);
            expect(res.body.createdAt)
              .to.be.a("string")
              .and.to.equal(createdAt);
            expect(res.body.updatedAt).to.be.a("string");
            expect(new Date(res.body.updatedAt)).to.be.afterTime(
              new Date(res.body.createdAt),
            );

            done();
          });
      });
    });
  });

  describe("DELETE /api/users/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})", () => {
    const id = faker.datatype.uuid();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.findName();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();
    const payload = { id, email };
    const token = jwt.sign(payload, fs.readFileSync("/tmp/test.key"), {
      algorithm: "RS256",
    });

    before(async () => {
      const query = `INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES ('${id}', '${email}', '${hashedPassword}', '${name}', '${createdAt}', '${createdAt}')`;
      await db.query(query);
    });

    describe("401", () => {
      it("when authentication is missing", (done) => {
        request(server.app)
          .delete(`/api/users/${id}`)
          .expect(401)
          .expect("Content-Type", /json/)
          .expect("WWW-Authenticate", "Bearer missing_token")
          .expect({
            message: "Check 'WWW-Authenticate' header",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });

      it("when authentication scheme is unknown", (done) => {
        const scheme = faker.datatype.string();

        request(server.app)
          .delete(`/api/users/${id}`)
          .set("Authorization", `${scheme} ${token}`)
          .expect(401)
          .expect("Content-Type", /json/)
          .expect("WWW-Authenticate", "Bearer unknown_scheme")
          .expect({
            message: "Check 'WWW-Authenticate' header",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });

      it("when authentication token is invalid", (done) => {
        const token = faker.datatype.string();

        request(server.app)
          .delete(`/api/users/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(401)
          .expect("Content-Type", /json/)
          .expect("WWW-Authenticate", /^Bearer invalid_token/)
          .expect({
            message: "Check 'WWW-Authenticate' header",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });
    });

    describe("403", () => {
      const payload = {
        id: faker.datatype.uuid(),
        email: faker.internet.email(),
      };
      const token = jwt.sign(payload, fs.readFileSync("/tmp/test.key"), {
        algorithm: "RS256",
      });

      it("when deleting another user", (done) => {
        request(server.app)
          .delete(`/api/users/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(403)
          .expect({
            message: "Not allowed to perform this action",
            name: "Forbidden",
            status: 403,
          })
          .end(done);
      });
    });

    describe("404", () => {
      const id = faker.datatype.uuid();
      const payload = {
        id,
        email: faker.internet.email(),
      };
      const token = jwt.sign(payload, fs.readFileSync("/tmp/test.key"), {
        algorithm: "RS256",
      });

      it("when user does not exist", (done) => {
        request(server.app)
          .delete(`/api/users/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            message: `User not found: '${id}'`,
            name: "NotFound",
            status: 404,
          })
          .end(done);
      });
    });

    describe("200", () => {
      it("when user does exist", (done) => {
        request(server.app)
          .delete(`/api/users/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(200)
          .expect({
            deleted: id,
          })
          .end(done);
      });
    });
  });

  describe("POST /api/projects", () => {
    const id = faker.datatype.uuid();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.findName();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();
    const payload = { id, email };
    const token = jwt.sign(payload, fs.readFileSync("/tmp/test.key"), {
      algorithm: "RS256",
    });

    before(async () => {
      const query = `INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES ('${id}', '${email}', '${hashedPassword}', '${name}', '${createdAt}', '${createdAt}')`;
      await db.query(query);
    });

    after(async () => {
      const query = `DELETE FROM users WHERE id = '${id}'`;
      await db.query(query);
    });

    describe("400", () => {
      it("when 'name' is missing", (done) => {
        request(server.app)
          .post("/api/projects")
          .send({
            redirectURL: faker.internet.url(),
            scope: faker.datatype.array().map((a) => a.toString()),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data must have required property 'name'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'name' is empty", (done) => {
        request(server.app)
          .post("/api/projects")
          .send({
            redirectURL: faker.internet.url(),
            scope: faker.datatype.array().map((a) => a.toString()),
            name: "",
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/name must NOT have fewer than 1 characters",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'redirectURL' is missing", (done) => {
        request(server.app)
          .post("/api/projects")
          .send({
            name: faker.name.findName(),
            scope: faker.datatype.array().map((a) => a.toString()),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data must have required property 'redirectURL'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'redirectURL' is empty", (done) => {
        request(server.app)
          .post("/api/projects")
          .send({
            name: faker.name.findName(),
            scope: faker.datatype.array().map((a) => a.toString()),
            redirectURL: "",
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/redirectURL must NOT have fewer than 1 characters",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'redirectURL' does not have the correct format", (done) => {
        request(server.app)
          .post("/api/projects")
          .send({
            name: faker.name.findName(),
            scope: faker.datatype.array().map((a) => a.toString()),
            redirectURL: faker.datatype.string(),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/redirectURL must match format 'uri'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'scope' is missing", (done) => {
        request(server.app)
          .post("/api/projects")
          .send({
            name: faker.name.findName(),
            redirectURL: faker.internet.url(),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data must have required property 'scope'",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });

      it("when 'scope' is empty", (done) => {
        request(server.app)
          .post("/api/projects")
          .send({
            name: faker.name.findName(),
            redirectURL: faker.internet.url(),
            scope: [],
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect({
            message: "data/scope must NOT have fewer than 1 items",
            name: "BadRequest",
            status: 400,
          })
          .end(done);
      });
    });

    describe("401", () => {
      it("when authentication is missing", (done) => {
        request(server.app)
          .post("/api/projects")
          .send({
            redirectURL: faker.internet.url(),
            scope: faker.datatype.array().map((a) => a.toString()),
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .expect("Content-Type", /json/)
          .expect(401)
          .expect("WWW-Authenticate", "Bearer missing_token")
          .expect({
            message: "Check 'WWW-Authenticate' header",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });

      it("when authentication scheme is unknown", (done) => {
        const scheme = faker.datatype.string();

        request(server.app)
          .post("/api/projects")
          .send({
            redirectURL: faker.internet.url(),
            scope: faker.datatype.array().map((a) => a.toString()),
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `${scheme} ${token}`)
          .expect("Content-Type", /json/)
          .expect(401)
          .expect("WWW-Authenticate", "Bearer unknown_scheme")
          .expect({
            message: "Check 'WWW-Authenticate' header",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });

      it("when authentication token is invalid", (done) => {
        const token = faker.datatype.string();

        request(server.app)
          .post("/api/projects")
          .send({
            redirectURL: faker.internet.url(),
            scope: faker.datatype.array().map((a) => a.toString()),
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(401)
          .expect("WWW-Authenticate", /^Bearer invalid_token/)
          .expect({
            message: "Check 'WWW-Authenticate' header",
            name: "Unauthorized",
            status: 401,
          })
          .end(done);
      });
    });

    describe("409", () => {
      const projectId = faker.datatype.uuid();
      const name = faker.name.findName();
      const redirectURL = faker.internet.url();
      const scope = ["email", "name"].map((a) => `"${a.toString()}"`);
      const secret = bcrypt.hashSync(faker.internet.password(), 10);

      before(async () => {
        const query = `INSERT INTO projects (id, name, redirect_url, scope, secret, creator, created_at, updated_at) VALUES ('${projectId}', '${name}', '${redirectURL}', '{${scope}}', '${secret}', '${id}', '${createdAt}', '${createdAt}')`;
        await db.query(query);
      });

      after(async () => {
        const query = `DELETE FROM projects WHERE id = '${projectId}'`;
        await db.query(query);
      });

      it("when 'redirectURL' already exist", (done) => {
        request(server.app)
          .post("/api/projects")
          .send({
            redirectURL,
            scope: faker.datatype.array().map((a) => a.toString()),
            name: faker.name.findName(),
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(409)
          .expect({
            message: "redirect_url must be unique",
            name: "Conflict",
            status: 409,
          })
          .end(done);
      });

      it("when 'name' already exist", (done) => {
        request(server.app)
          .post("/api/projects")
          .send({
            redirectURL: faker.internet.url(),
            scope: faker.datatype.array().map((a) => a.toString()),
            name,
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect(409)
          .expect({
            message: "name must be unique",
            name: "Conflict",
            status: 409,
          })
          .end(done);
      });
    });

    describe("201", () => {
      it("when project is valid", (done) => {
        const redirectURL = faker.internet.url();
        const name = faker.name.findName();
        const scope = faker.datatype.array().map((i) => i.toString());

        request(server.app)
          .post("/api/projects")
          .send({
            redirectURL,
            scope,
            name,
          })
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${token}`)
          .expect("Content-Type", /json/)
          .expect("Location", /projects/)
          .expect(201)
          .end(async (err, res) => {
            if (err) return done(err);

            expect(res.body).to.have.keys(
              "id",
              "redirectURL",
              "name",
              "secret",
              "scope",
              "creator",
              "createdAt",
              "updatedAt",
            );
            expect(res.body.id).to.be.a("string");
            expect(res.body.redirectURL)
              .to.be.a("string")
              .and.to.equal(redirectURL);
            expect(res.body.creator).to.be.a("string").and.to.equal(id);
            expect(res.body.name).to.be.a("string").and.to.equal(name);
            expect(res.body.scope).to.be.an.array().and.to.equalTo(scope);
            expect(res.body.createdAt).to.be.a("string");
            expect(res.body.updatedAt).to.be.a("string");

            const query = `DELETE FROM projects WHERE id = '${res.body.id}'`;
            await db.query(query);

            done();
          });
      });
    });
  });
});
