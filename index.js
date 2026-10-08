import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDB from "./src/db/db connection.js";
import createApp from "./src/bootstrap.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "config", ".env") });

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => console.log("Server running on port " + PORT));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
