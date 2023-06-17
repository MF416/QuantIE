import { ethers } from "ethers";
const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY;

export async function eventListener() {
  let abi = [
    "event ImpactEvaluation(string LastEvaluation, address rewardee, uint amount)",
    "function rewardTransaction(address payable _rewardee, uint _amount, string memory _payloadCID)",
  ];
  console.log("listen");
  var contractAddress = "0x68cE49b6f5497957C723133DCCc2351CE3327A82"; // Deployed RewardIE contract

  // Connect to the network
  let httpProvider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
  );
  console.log("httpProvider", httpProvider);

  let contract = new ethers.Contract(contractAddress, abi, httpProvider);
  console.log("contract", contract);
  // Event listener
  contract.on("ImpactEvaluation", (compCID, NewTransaction, amount, event) => {
    console.log(
      "New transaction calculation: " +
        compCID +
        " Sent to: " +
        NewTransaction +
        " For amount: " +
        amount
    );
  });
}
