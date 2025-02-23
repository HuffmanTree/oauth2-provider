/* eslint no-console: off */

import { spawn } from "node:child_process";
import { default as bcrypt } from "bcrypt";
import cors from "cors";
import express from "express";
import { default as pg } from "pg";
const client = new pg.Client("postgres://postgres:secret@localhost:5432/oauth2");

async function main() {
  await client.connect();

  await client.query(`INSERT INTO users VALUES (
  '54440658-db77-41f0-a15b-6a814b6cfa80'::uuid,
  'eric.dampierre@yopmail.fr',
  '${bcrypt.hashSync("secret", 10)}',
  'Eric',
  'Dampierre',
  'https://img.freepik.com/vecteurs-libre/illustration-homme-affaires_53876-5856.jpg',
  NULL,
  '1986-08-23',
  'male',
  NOW(),
  NOW()) ON CONFLICT DO NOTHING`);

  await client.query(`INSERT INTO projects VALUES (
  '0ebbc4e5-9dec-4ad2-a3cd-b10efb63f6b3'::uuid,
  '${bcrypt.hashSync("945ad59cea787dcab96f694c1e0e5ccd259e94c7c59157c62c4420bdca06c38a", 10)}',
  'Telecom3000',
  'http://localhost:5050/callback',
  '{openid, given_name, family_name}',
  '54440658-db77-41f0-a15b-6a814b6cfa80'::uuid,
  NOW(),
  NOW()) ON CONFLICT DO NOTHING`);

  await client.end();
}

main()
  .then(() => {
    const app = express();
    app.use(cors());
    app.get<unknown, unknown, unknown, { code: string }>("/callback", async (req, res) => {
      res.status(204).send();

      const tokenResp = await fetch("http://localhost:8080/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: "0ebbc4e5-9dec-4ad2-a3cd-b10efb63f6b3",
          client_secret: "945ad59cea787dcab96f694c1e0e5ccd259e94c7c59157c62c4420bdca06c38a",
          code: req.query.code,
          grant_type: "authorization_code",
          redirect_uri: "http://localhost:5050/callback",
        }),
      });
      const { token_type, access_token }: {
        access_token: string,
        token_type: string,
        expires_in: number,
        id_token: string,
      } = await tokenResp.json();

      const infoResp = await fetch("http://localhost:8080/api/oauth2/userinfo", {
        method: "GET",
        headers: {
          Authorization: `${token_type} ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      const { given_name, family_name }: {
        given_name: string,
        family_name: string,
      } = await infoResp.json();

      console.log(`Welcome ${given_name} ${family_name}!`);

      process.exit(0);
    });
    app.listen(5050, "localhost", () => {
      console.log("App listening on 'localhost:5050' ...");
    });

    const queryParams = new URLSearchParams({
      response_type: "code",
      client_id: "0ebbc4e5-9dec-4ad2-a3cd-b10efb63f6b3",
      redirect_uri: "http://localhost:5050/callback",
      scope: ["given_name", "family_name"].join(","),
    });

    spawn("firefox", [`http://localhost:5173/consent?${queryParams.toString()}`]);
  });
