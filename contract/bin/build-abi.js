const fs = require('fs');
const path = require('path');

const contractsPath = path.resolve(__dirname, '../build/contracts');
const abiPath = path.resolve(__dirname, '../build/abi');

fs.readdir(contractsPath, (err, files) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  if (!fs.existsSync(abiPath)) {
    fs.mkdirSync(abiPath);
  }

  files.forEach(file => {
    fs.readFile(
      path.join(contractsPath, file),
      { encoding: 'utf8'},
      (err, data) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        const json = JSON.parse(data);
        fs.writeFileSync(path.join(abiPath, file), JSON.stringify(json.abi, null, 2));
      }
    );
  });
});