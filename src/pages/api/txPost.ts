import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    // Parse the incoming JSON data
    console.log("Request body: ", req.body);
    console.log(req.body.txID);
    console.log(req.body.contractId);
    const txHash = req.body.txID;
    const inputCID = req.body.impactCID;
    const value = req.body.value;
    const ContractID = req.body.contractId;
    const ProjectID = req.body.projectId;

    // Validate the input data if needed
    // ...

    // Use Prisma to create a new row in the Transactions table
    const transaction = await prisma.transaction.create({
      data: {
        txID: txHash,
        // rewardee: "laurent",
        impactCID: inputCID,
        value: value,
        contractId: ContractID,
        projectId: ProjectID,
      },
    });

    return res.status(201).json(transaction); // Created
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

