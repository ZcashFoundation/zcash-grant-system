import node from '../node';
import { extractErrMessage } from '../util';

async function printAddressAndKey() {
  try {
    let address = await node.z_getnewaddress('sprout');
    const viewkey = await node.z_exportviewingkey(address);

    console.log("\nCopy these to your .env\n");
    console.log(`SPROUT_ADDRESS="${address}"`);
    console.log(`SPROUT_VIEWKEY="${viewkey}"\n`);
  } catch(err) {
    console.error(extractErrMessage(err));
    process.exit(1);
  }
}

printAddressAndKey();
