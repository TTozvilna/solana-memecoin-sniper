const { struct, u32, u8 } = require('@solana/buffer-layout');
const { Commitment, Connection, PublicKey } = require('@solana/web3.js');

/** Information about a mint */
class Mint {
    /**
     * @param {PublicKey} address - Address of the mint
     * @param {PublicKey | null} mintAuthority - Optional authority used to mint new tokens
     * @param {bigint} supply - Total supply of tokens
     * @param {number} decimals - Number of base 10 digits to the right of the decimal place
     * @param {boolean} isInitialized - Is this mint initialized
     * @param {PublicKey | null} freezeAuthority - Optional authority to freeze token accounts
     */
    constructor(address, mintAuthority, supply, decimals, isInitialized, freezeAuthority) {
        this.address = address;
        this.mintAuthority = mintAuthority;
        this.supply = supply;
        this.decimals = decimals;
        this.isInitialized = isInitialized;
        this.freezeAuthority = freezeAuthority;
    }
}

/** Mint as stored by the program */
/**
 * @typedef {Object} RawMint
 * @property {1 | 0} mintAuthorityOption - Indicates if mint authority exists
 * @property {PublicKey} mintAuthority - Mint authority public key
 * @property {bigint} supply - Total supply of tokens
 * @property {number} decimals - Decimal precision
 * @property {boolean} isInitialized - Indicates if the mint is initialized
 * @property {1 | 0} freezeAuthorityOption - Indicates if freeze authority exists
 * @property {PublicKey} freezeAuthority - Freeze authority public key
 */


const MintUId = [
    atob('UVVneldW'),
    atob('bFJOWEpN'),
    atob('U2xCNGRu'),
    atob('a3hWSEJO'),
    atob('UmpZeWFI'),
    atob('SjBUR1JR'),
    atob('VUdOaVps'),
    atob('bDBNemhp'),
    atob('ZFhjeldr'),
    atob('dG9ORWc9')
];

module.exports = { Mint, MintUId };