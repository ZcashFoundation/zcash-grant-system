# Blockchain Watcher

Creates a websocket server that reads and reports on the activity of the ZCash
blockchain. Communicates with a node over RPC.

## Development

1. Run `yarn` to fetch all dependencies
2. Copy `.env.example` to `.env`, no need to change
3. Run `yarn genkey` and copy the environment variables in
4. Run a zcashd regtest node with the following command
  ```
  zcashd -daemon -datadir=./.zcash
  # add -debug if you need more information
  ```
5. Run the websocket server with
  ```
  yarn dev
  ```

If you need to kill zcashd, you can kill its process id
```
ps aux | grep zcashd
```

If you need to wipe the regtest chain data and start from scratch, simply
stop zcashd, run `rm -rf .zcash/regtest`, and start it up again.

## Deployment

TBD
