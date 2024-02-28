import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

describe("anchor-vault-2024", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Vault as Program<Vault>;

  const connection = anchor.getProvider().connection;

  const maker = Keypair.generate();
  const taker = Keypair.generate();

  const vault = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), maker.publicKey.toBuffer()],
    program.programId
  )[0];

  const vaultState = PublicKey.findProgramAddressSync(
    [Buffer.from("VaultState"), maker.publicKey.toBuffer()],
    program.programId
  )[0];

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  it("Airdrop", async () => {
    await connection
      .requestAirdrop(maker.publicKey, LAMPORTS_PER_SOL * 10)
      .then(confirm)
      .then(log);
    await connection
      .requestAirdrop(taker.publicKey, LAMPORTS_PER_SOL * 10)
      .then(confirm)
      .then(log);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accounts({
        vault,
        maker: maker.publicKey,
        vaultState,
        taker: taker.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);
  });

  it("Can Deposit!", async () => {
    // Add your test here.
    const tx = await program.methods
      .deposit(new anchor.BN(1_000_000))
      .accounts({
        vault,
        maker: maker.publicKey,
        vaultState,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);
  });

  xit("Can Cancel!", async () => {
    // Add your test here.
    const tx = await program.methods
      .cancel()
      .accounts({
        vault,
        maker: maker.publicKey,
        vaultState,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);
  });

  it("Can Withdraw!", async () => {
    // Add your test here.

    const tx2 = await program.methods
      .withdraw()
      .accounts({
        vault,
        maker: maker.publicKey,
        taker: taker.publicKey,
        vaultState,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([taker])
      .rpc()
      .then(confirm)
      .then(log);
  });
});
