import { start, exit } from "./service";
import dotenv from "dotenv";

dotenv.load();
start();

process.on("SIGINT", () => {
  console.log("Service exited.");
  exit();
  process.exit();
});
