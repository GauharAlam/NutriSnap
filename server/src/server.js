import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { app } from "./app.js";

async function bootstrap() {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(`API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to bootstrap server", error);
    process.exit(1);
  }
}

bootstrap();
