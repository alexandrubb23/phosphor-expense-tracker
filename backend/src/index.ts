import "@/instrument";
import { createApp } from "@/createApp";
import { env } from "@/env";
import { startQueue } from "@/lib/queue";

const app = createApp();

await startQueue();

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

export default app;
