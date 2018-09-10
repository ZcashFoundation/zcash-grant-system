// moves "export" out dir into root
var fs = require('fs-extra');
fs.removeSync('out');
var spawn = require('child_process').spawn,
  mv = spawn('mv', ['client/out', 'out']);
