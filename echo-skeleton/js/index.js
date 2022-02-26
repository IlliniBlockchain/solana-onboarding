const {
  Connection,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
} = require("@solana/web3.js");

const BN = require("bn.js");

const main = async () => {

  // Get command line arguments
  var args = process.argv.slice(2);
  const programId = new PublicKey(args[0]);
  const echo = args[1];

  // Connection object for devnet
  const connection = new Connection("https://api.devnet.solana.com/");

  // Generate accounts
  const feePayer = new Keypair();
  const echoBuffer = new Keypair();

  // Airdrop feePayer account some SOL to pay for tx
  console.log("Requesting Airdrop of 1 SOL...");
  await connection.requestAirdrop(feePayer.publicKey, 2e9);
  console.log("Airdrop received");

  // Define *instruction* to allocate data for echo buffer
  // This is a helpful wrapper that creates an instruction
  let createIx = SystemProgram.createAccount({
    fromPubkey: feePayer.publicKey,
    newAccountPubkey: echoBuffer.publicKey,
    /** Amount of lamports to transfer to the created account */
    lamports: await connection.getMinimumBalanceForRentExemption(echo.length),
    /** Amount of space in bytes to allocate to the created account */
    space: echo.length,
    /** Public key of the program to assign as the owner of the created account */
    programId: programId,
  });

  // Define data buffers for instruction input
  // idx = instruction index, 0 = first instr = Echo
  const idx = Buffer.from(new Uint8Array([0])); 
  // The second part of the input data is a vector
  // If you check out the borsh specification for how to send a vector as an array of bytes
  // The first 4 bytes are the size of the vector, the rest of the bytes are the values
  const messageLen = Buffer.from(new Uint8Array((new BN(echo.length)).toArray("le", 4)));
  const message = Buffer.from(echo, "ascii");
  // Put them together
  const inputDataBuffer = Buffer.concat([idx, messageLen, message]);

  // Define *instruction* to call Echo in our program
  let echoIx = new TransactionInstruction({
    keys: [
      {
        pubkey: echoBuffer.publicKey,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: programId,
    data: inputDataBuffer,
  });

  // Create the transaction
  let tx = new Transaction();
  // Note: transactions are made up of multiple instructions
  tx.add(createIx).add(echoIx);

  // Send the transaction
  let txid = await sendAndConfirmTransaction(
    connection,
    tx,
    [feePayer, echoBuffer],
    {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      confirmation: "confirmed",
    }
  );
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

  // Get an account from the blockchain (our echoBuffer account)
  // echoBufferData is an array of bytes, as is any account's raw data
  const echoBufferData = (await connection.getAccountInfo(echoBuffer.publicKey)).data;
  console.log("Echo Buffer Text:", echoBufferData.toString());
};

main()
  .then(() => {
    console.log("Success");
  })
  .catch((e) => {
    console.error(e);
  });
