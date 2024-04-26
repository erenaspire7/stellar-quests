import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk";

import { airdrop, executeTx, server } from "./../helper";

import { NFTStorage, Blob } from "nft.storage";

(async () => {
  const issuerKeypair = Keypair.random();
  const receiverKeypair = Keypair.fromSecret(
    "SDZBP7NW4AB7EM5FIOEFLGVTVIL2MQRCTHY45QZKSKPIISXMCBO4Z436"
  );

  await airdrop([issuerKeypair]);

  const nftAsset = new Asset("vvNFT", issuerKeypair.publicKey());

  const NFT_STORAGE_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGVENmQ4NjMyRWZBYzgyMTExNDk1Yzk4NWUyNmI3N0Y5MDBCRjgwYzUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNjM0Mzg2ODE5OCwibmFtZSI6IkxhbmQgVG9rZW4ifQ.iH5zbMhsoY4FRoU1qEU0lHzDUIAEJyfmwA1IYhisFRc";

  let imageCID = "bafybeif42qpg2okduatew5fnkkecnwfnenrazgwsuhyphm27gk3lhmunee";

  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

  const metadata = {
    name: "Very Valuable NFT",
    description:
      "This is the most valuable NFT available on any blockchain. Ever.",
    url: `https://nftstorage.link/ipfs/${imageCID}`,
    issuer: nftAsset.getIssuer(),
    code: nftAsset.getCode(),
  };

  const metadataCID = await client.storeBlob(
    new Blob([JSON.stringify(metadata)])
  );

  const account = await server.loadAccount(issuerKeypair.publicKey());

  // Build a new transaction that mints the NFT.
  let transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    // Add the NFT metadata to the issuer account using a `manageData` operation.
    .addOperation(
      Operation.manageData({
        name: "ipfshash",
        value: metadataCID,
        source: issuerKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.changeTrust({
        asset: nftAsset,
        limit: "0.0000001",
        source: receiverKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.payment({
        destination: receiverKeypair.publicKey(),
        asset: nftAsset,
        amount: "0.0000001",
        source: issuerKeypair.publicKey(),
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(issuerKeypair);
  transaction.sign(receiverKeypair);

  await executeTx(transaction);
})();
