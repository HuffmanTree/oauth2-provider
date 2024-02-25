import "dotenv/config";
import { OAuth2Server } from "./server.js";

const server = new OAuth2Server({});
server.start();
