const path = require('path');
const { generateTypeChainWrappers } = require('typechain');

process.env.DEBUG = 'typechain';
generateTypeChainWrappers({
  cwd: path.resolve(__dirname, '..'),
  glob: path.resolve(__dirname, '../build/abi/*.json'),
  outDir: path.resolve(__dirname, '../build/typedefs'),
  force: true,
});
