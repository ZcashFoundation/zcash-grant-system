const req = require.context('./', true, /.story.tsx$/);
req.keys().forEach(filename => req(filename));
