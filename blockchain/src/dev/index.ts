import dotenv from "dotenv";
import http from "http";
import fs from "fs";

dotenv.load();

import "../index";

const hostname = "127.0.0.1";
const port = 3050;

const server = http
  .createServer(function(request, response) {
    fs.readFile("./src/dev/index.html", function(err, html) {
      if (err) {
        throw err;
      }
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(
        html
          .toString()
          .replace("$$API_SECRET_KEY", process.env.API_SECRET_KEY || "")
          .replace("$$PORT", process.env.PORT || "")
      );
      response.end();
    });
  })
  .listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
