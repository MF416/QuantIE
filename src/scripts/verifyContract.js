const axios = require("axios");

export async function getContractTransactions(contractAddress) {
  const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  const apiUrl = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${contractAddress}&sort=desc&apikey=${ETHERSCAN_API_KEY}`;

  console.log(contractAddress);
  try {
    const response = await axios.get(apiUrl);
    if (response.data.status == 0) {
      throw new Error(
        "Error retrieving contract transactions:",
        response.data.message
      );
    }
    const transactions = response.data.result.slice(0, 10); // Get the first 10 transactions

    // Test output file
    // var fs = require('fs');
    // fs.writeFileSync('file.json', JSON.stringify(response.data));

    return transactions;
  } catch (error) {
    console.error("Error retrieving contract transactions:", error);
    return [];
  }
}

// Example usage
/*
const contractAddress = '0x68cE49b6f5497957C723133DCCc2351CE3327A82';
getContractTransactions(contractAddress)
  .then(transactions => {
    console.log('Last 10 transactions:');
    transactions.forEach(transaction => {
      console.log(`- Hash: ${transaction.hash}`);
      console.log(`- Timestamp: ${transaction.timeStamp}`);
      console.log(`  From: ${transaction.from}`);
      console.log(`  To: ${transaction.to}`);
      console.log(`  Value: ${transaction.value}`);
      console.log('--------------------------');
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });
*/
