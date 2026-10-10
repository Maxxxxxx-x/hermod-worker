import { Hono } from "hono";

import email from "./email";

const v1 = new Hono();

v1.route("/email", email);

export default v1;
