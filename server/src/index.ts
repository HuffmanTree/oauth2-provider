import "dotenv/config";
import { OAuth2Server } from "./server";

const server = new OAuth2Server({});
server.start();
