import { ethers } from "ethers";

export async function rewardTransaction(txCID) {
  const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY;
  const SEPOLIA_PRIVATE_KEY = process.env.NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY;

  let abi = [
    "event ImpactEvaluation(string LastEvaluation, address rewardee, uint amount)",
    "function rewardTransaction(address payable _rewardee, uint _amount, string memory _payloadCID)",
  ];
  console.log("reward");
  // Hardcoded list of CIDs used as test
  //var txCID = "QmXhQhVgMYqBTVfbWghycrQTz4uvXFCpJBqUHfF7Ya2Ca8"; // New transaction CID

  // List of addresses from deployed contract
  var claimAddress = "0x58A09079b225d6d00eb41C7b8e70ffd7e4163143"; //CJ address
  var contractAddress = "0x68cE49b6f5497957C723133DCCc2351CE3327A82"; // Contract deployed to Sepolia

  // Connect to the local network
  let httpProvider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
  );
  console.log("httpProvider", httpProvider);

  // We connect to the Contract using a Provider, so we will only
  // have read-only access to the Contract
  let contract = new ethers.Contract(contractAddress, abi, httpProvider);

  // A Signer from a private key
  let privateKey = SEPOLIA_PRIVATE_KEY;
  let wallet = new ethers.Wallet(privateKey, httpProvider);

  // Create a new instance of the Contract with a Signer, which allows
  // update methods
  let contractWithSigner = contract.connect(wallet);
  console.log("contractWithSigner", contractWithSigner);
  let tx = await contractWithSigner.rewardTransaction(
    claimAddress,
    ethers.utils.parseEther("0.00009"),
    txCID
  );
  await tx.wait();
  console.log("tx", tx);
}
