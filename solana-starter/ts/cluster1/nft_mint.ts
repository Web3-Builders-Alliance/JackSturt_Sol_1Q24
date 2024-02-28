import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wba-wallet.json";
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

const mint = generateSigner(umi);

(async () => {
  //   metadata URI from ./nft_metadata
  const uri = "https://arweave.net/DkG9B1li6TdxmgzcMFoZ4IpRH2zYW8UTJH9k5snJqrQ";
  // create the nft creation tx
  let tx = createNft(umi, {
    // mint from line 24
    mint,
    // name you want
    name: "Very Nice Rug",
    // symbol
    symbol: "RUG",
    // metadata URI from line 28
    uri,
    // percentage fee
    sellerFeeBasisPoints: percentAmount(5),
  });
  // send the transaction
  let result = await tx.sendAndConfirm(umi);
  // parse the result
  const signature = base58.encode(result.signature);

  // print
  console.log(
    `Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
  );

  console.log("Mint Address: ", mint.publicKey);
})();
