import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
  Asset,
  LiquidityPoolAsset,
  getLiquidityPoolId,
} from "@stellar/stellar-sdk";
import { airdrop, executeTx, server } from "../helper";

(async () => {
  const questKeypair = Keypair.fromSecret(
    "SCNWQE5LG6GYXWQ4JO64RAPMZMGEOTJOSBBED6CQSOXYB4IFLR6LIE7F"
  );
  const questAccount = await server.loadAccount(questKeypair.publicKey());

  const noodleAsset = new Asset("NOODLE", questKeypair.publicKey());

  const lpAsset = new LiquidityPoolAsset(Asset.native(), noodleAsset, 30);

  const liquidityPoolId = getLiquidityPoolId(
    "constant_product",
    lpAsset
  ).toString("hex");

  const lpDepositTransaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset: lpAsset,
      })
    )
    .addOperation(
      Operation.liquidityPoolDeposit({
        liquidityPoolId: liquidityPoolId,
        maxAmountA: "100",
        maxAmountB: "100",
        minPrice: {
          n: 1,
          d: 1,
        },
        maxPrice: {
          n: 1,
          d: 1,
        },
      })
    )
    .setTimeout(30)
    .build();

  lpDepositTransaction.sign(questKeypair);

  await executeTx(lpDepositTransaction);

  const tradeKeypair = Keypair.random();

  await airdrop([tradeKeypair]);

  const tradeAccount = await server.loadAccount(tradeKeypair.publicKey());

  const pathPaymentTransaction = new TransactionBuilder(tradeAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset: noodleAsset,
        source: tradeKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.pathPaymentStrictReceive({
        sendAsset: Asset.native(),
        sendMax: "1000",
        destination: tradeKeypair.publicKey(),
        destAsset: noodleAsset,
        destAmount: "1",
        source: tradeKeypair.publicKey(),
      })
    )
    .setTimeout(30)
    .build();

  pathPaymentTransaction.sign(tradeKeypair);

  await executeTx(pathPaymentTransaction);

  const lpWithdrawTransaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.liquidityPoolWithdraw({
        liquidityPoolId: liquidityPoolId,
        amount: "100",
        minAmountA: "0",
        minAmountB: "0",
      })
    )
    .setTimeout(30)
    .build();

  lpWithdrawTransaction.sign(questKeypair);

  await executeTx(lpWithdrawTransaction);
})();
