# Blockchain Watcher

Creates a websocket server that reads and reports on the activity of the Zcash
blockchain. Communicates with a node over RPC.

## Development

### First time setup (Only do once)

1. Run `yarn` to fetch all dependencies
2. Copy `.env.example` to `.env`
3. Run a zcashd regtest node with the following command
  ```
  zcashd -daemon -datadir=./.zcash -wallet=offline.dat
  ```
4. Mine at least 100 blocks with `zcash-cli generate 101` to activate Overwinter and Sapling
4. Run `yarn genkey` and copy the environment variables into `.env`
6. Run `yarn genaddress` and copy the environment variables into `.env`

### After all that...

1. Run zcashd (without the offline wallet)
  ```
  zcashd -daemon -datadir=./.zcash
  ```
2. Run the websocket server with
  ```
  yarn dev
  ```

See [the Wiki page](https://github.com/dternyak/zcash-grant-system/wiki/Running-ZCash-Regtest) for more information on running a regtest node.

## Deployment

TBD
