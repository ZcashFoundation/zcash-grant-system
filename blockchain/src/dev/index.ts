import http from "http";
import fs from "fs";
import env from "../env";

import "../index";

const hostname = "127.0.0.1";
const port = 3050;

http.createServer(function(request, response) {
  fs.readFile("./src/dev/index.html", function(err, html) {
    if (err) {
      throw err;
    }
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(
      html
        .toString()
        .replace(/\$\$API_SECRET_KEY/g, env.API_SECRET_KEY || "")
        .replace(/\$\$REST_PORT/g, env.REST_SERVER_PORT || "")
    );
    response.end();
  });
})
.listen(port, hostname, () => {
  console.log(`Devtool running at http://${hostname}:${port}/`);
});
