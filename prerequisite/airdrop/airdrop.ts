import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import wallet from "./dev-wallet.json";
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const connection = new Connection("https://api.devnet.solana.com");
(async () => {
  try {
    // We're going to claim 2 devnet SOL tokens
    const txhash = await connection.requestAirdrop(
      keypair.publicKey,
      //   It fails for me with 2 sol so just run this twice
      LAMPORTS_PER_SOL
    );
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: txhash,
      lastValidBlockHeight,
      blockhash,
    });
    console.log(`Success! Check out your TX here:
    https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
