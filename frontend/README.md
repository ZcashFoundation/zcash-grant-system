# Grant.io Front-End

This is the front-end component of [Grant.io](http://grant.io).


## Development

1. Install local project dependencies, and also install Truffle & Ganache globally:
    ```bash
    # Local dependencies
    yarn
    # Global dependencies
    yarn global add truffle ganache-cli
    ```

2. (In a separate terminal) Run the ganache development blockchain:
    ```bash
    yarn run ganache
    ```

3. Ensure you have grant-contract cloned locally and setup.


4. (In a separate terminal) Initialize truffle, open up the repl (Changes to smart contracts will require you to re-run this):
    ```bash
    yarn run truffle
    ```

5. Run the next.js server / webpack build for the front-end:
    ```bash
    yarn run dev
    ```

5. Go to the dapp on localhost:3000. You'll need to setup metamask to connect to the ganache network. You'll want to add a custom "RPC" network, and point it towards localhost:8545.


## Testing

### Application

TBD

### Smart Contract

Truffle can run tests written in Solidity or JavaScript against your smart contracts. Note the command varies slightly if you're in or outside of the development console.

```bash
# If inside the truffle console
test

# If outside the truffle console
truffle test
```
