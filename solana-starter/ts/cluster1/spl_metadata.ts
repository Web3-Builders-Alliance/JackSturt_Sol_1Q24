import wallet from "../wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import base58 from "bs58";

// Define our Mint address
const mint = publicKey("Lg56zjo8Cz1voTY4StJ8w4xvwocA3aWjtTthz3SzaMw");

// Create a UMI connection
const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
  try {
    // Start here
    let accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint: mint,
      mintAuthority: signer,
    };

    let data: DataV2Args = {
      name: "WBA Token - Jack Sturt",
      symbol: "WBA",
      uri: "https://www.sturt.io",
      sellerFeeBasisPoints: 500,
      creators: null,
      collection: null,
      uses: null,
    };

    let args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null,
    };

    let tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });

    let result = await tx
      .sendAndConfirm(umi)
      .then((r) => base58.encode(r.signature));
    console.log(
      `Your mint txid: https://explorer.solana.com/tx/${result}?cluster=devnet`
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
