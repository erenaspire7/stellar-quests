import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
  MuxedAccount,
  Asset,
} from "@stellar/stellar-sdk";
import { airdrop, executeTx, server } from "../helper";

(async () => {
  const questKeypair = Keypair.fromSecret(
    "SASRZTF3DNPUVHGA55EB5Z3NBCKVHWZZYL5PYTHBGHQ2CNAN3XAHJLLL"
  );

  const familyKeypair = Keypair.random();

  await airdrop([familyKeypair]);

  const questAccount = await server.loadAccount(questKeypair.publicKey());

  // Begin building the transaction. We will add the payment operations in a bit
  let transaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  });

  const familyAccount = await server.loadAccount(familyKeypair.publicKey());

  const familyMuxedAccounts = ["4", "132", "232", "255"].map(
    (id) => new MuxedAccount(familyAccount, id)
  );

  familyMuxedAccounts.forEach((familyMember) => {
    // // Optional: log the muxed account details
    // console.log(`${familyMember.id().padStart(4, " ")}: ${familyMember.accountId()}`)

    transaction = transaction.addOperation(
      Operation.payment({
        destination: familyMember.accountId(),
        asset: Asset.native(),
        // We are using the muxed account ID here as the `amount`, because it's
        // a simple way to ensure unique amounts for each of the payments.
        amount: familyMember.id(),
        source: questKeypair.publicKey(),
      })
    );
  });

  // `setTimeout` is required for a transaction, and it also must be built.
  let tx = transaction.setTimeout(30).build();

  tx.sign(questKeypair);

  await executeTx(tx);
})();
