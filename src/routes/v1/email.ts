import { Hono } from "hono";

const email = new Hono();

email.post("/", (ctx) => ctx.json("test post", 200));
email.get("/", (ctx) => ctx.json("test get", 200));

export default email;
