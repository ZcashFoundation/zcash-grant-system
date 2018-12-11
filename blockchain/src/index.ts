import { start, exit } from "./service";
import dotenv from "dotenv";

dotenv.load();
start();

process.on("SIGINT", () => {
  exit();
  console.log("Service exited.");
  process.exit();
});
