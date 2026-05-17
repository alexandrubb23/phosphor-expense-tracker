import "./instrument.js";
import { createApp } from "./createApp.js";
import { env } from "./env.js";
import { startQueue } from "./lib/queue.js";

const app = createApp();

await startQueue();

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

export default app;
