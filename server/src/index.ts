import { Hono } from "hono";
import { cors } from "hono/cors";
import api from "./routes/api";

const app = new Hono();

app.use(cors());

app.route("/api", api);
app.get("/", (c) => c.json({ message: "Server Is Running" }));

export default app;
