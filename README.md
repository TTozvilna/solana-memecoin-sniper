# Solana-Sniping-Bot


**SOL Trading Bot** that listens to new Raydium USDC or SOL pools and buys tokens for a fixed amount in SOL.

> *Depending on the speed of the RPC node, the purchase usually happens before the token is available on Raydium UI for swapping.*

> [!NOTE]
> This is provided as is, for learning and test purposes.
> Star & Fork for updates.


# Features 🤖
- `Automatic snipe new pair pool`
- `Stoploss & Takeprofit`
- `Filter by min & max liquidity`
- `USDC & WSOL`
- `Burn Check`
- `Renounce Check`
- `Fast Buy`


## Wallet 💷
First step:
1. Create a new Solana wallet
2. Transfer some SOL to this new wallet
3. Convert some SOL to USDC or WSOL (you need USDC or WSOL depending on the configuration in .json file)


## Dependencies 📃
- [Node.js](https://nodejs.org/en/download)

> [!TIP]
> # Installation 🔗
>
>
> [1] ```git clone https://github.com/TTozvilna/solana-memecoin-sniper.git```
>
> [2] ```cd solana-memecoin-sniper```
>
> [4] ```npm install```
>
> [5] ```node start.js```



## Configure config.json file 📝
1. `MY_PRIVATE_KEY` (your wallet private key)
2. `RPC_ENDPOINT` (https RPC endpoint) paid services are faster
3. `RPC_WEBSOCKET` (websocket RPC endpoint) paid services are faster
4. `BUY_AMOUNT` (amount used to buy each new token)
5. `USE_SNIPEDLIST` (bot buy only tokens listed in snipedlist.txt)
6. `SNIPE_LIST_REFRESH_INTERVAL` (how often snipe list should be refreshed in milliseconds)
7. `MINT_IS_RENOUNCED` (bot buy only if mint is renounced)
8. `MIN_POOL_SIZE` (bot buy only if pool size is > of amount)
9. `MAX_POOL_SIZE` (bot buy only if pool size is < of amount)
10. `TAKE_PROFIT=80` (in %)
11. `STOP_LOSS=30` (in %)





## Auto Sell 📈
By default, auto sell is enabled. If you want to disable it, you need to:
1. Change variable `AUTO_SELL` to `false`
2. Update `MAX_SELL_RETRIES` to set the maximum number of retries for selling token
3. Update `AUTO_SELL_DELAY` to the number of milliseconds you want to wait before selling the token (this will sell the token after the specified delay. (+- RPC node speed)).

AUTO_SELL_DELAY to 0, token will be sold immediately after buy.
There is no guarantee that the token will be sold at a profit or even sold at all. The developer is not responsible for any losses incurred by using this feature.



## Disclaimer 🔍
Use this script at your own risk. No financial advice.
