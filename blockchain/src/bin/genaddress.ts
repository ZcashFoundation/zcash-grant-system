import node from '../node';

async function printAddressAndKey() {
  try {
    let address = await node.z_getnewaddress('sprout');
    const viewkey = await node.z_exportviewingkey(address);

    console.log("\nCopy these to your .env\n");
    console.log(`SPROUT_ADDRESS="${address}"`);
    console.log(`SPROUT_VIEWKEY="${viewkey}"\n`);
  } catch(err) {
    if (err.response && err.response.data) {
      console.error(err.response.data);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

printAddressAndKey();
