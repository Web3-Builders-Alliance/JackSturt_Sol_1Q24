import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import wallet from "../wba-wallet.json";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("Lg56zjo8Cz1voTY4StJ8w4xvwocA3aWjtTthz3SzaMw");

// Recipient address
const to = new PublicKey("2uESnwhDVSPDZCBhegfUxjRNs5vxLh243QpyMGPmda88");

(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it

    const ataFrom = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );

    // Get the token account of the toWallet address, and if it does not exist, create it
    const ataTo = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to
    );

    // Transfer the new token to the "toTokenAccount" we just created
    const txid = await transfer(
      connection,
      keypair,
      ataFrom.address,
      ataTo.address,
      keypair.publicKey,
      1e6
    );
    console.log(
      `Your mint txid: https://explorer.solana.com/tx/${txid}?cluster=devnet`
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
