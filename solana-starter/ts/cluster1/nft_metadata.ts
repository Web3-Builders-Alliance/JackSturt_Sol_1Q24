import wallet from "../wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createBundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");
const bundlrUploader = createBundlrUploader(umi);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    // Follow this JSON structure
    // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
    // Image URI from ./nft_image
    const image =
      "https://arweave.net/jpzcuJLhVgijbCr3a0KoJz_pu7FBjr9VmyfOnd-K5Xg";
    // metadata for NFT
    const metadata = {
      name: "Very Nice Rug",
      symbol: "RUG",
      description: "Goodly Expensive, Buy now. Price will only go up, trust me",
      image,
      attributes: [{ trait_type: "Super Rare", value: "123_456_789" }],
      properties: {
        files: [
          {
            type: "image/png",
            uri: image,
          },
        ],
      },
      creators: [{ address: keypair.publicKey, share: 100 }],
    };
    // Upload the metadata using uploadJSON
    const myUri = await bundlrUploader.uploadJson([metadata]);
    console.log("Your image URI: ", myUri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
