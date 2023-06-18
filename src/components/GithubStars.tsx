import { useState } from "react";
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import { eventListener } from "../scripts/eventListener";
import { rewardTransaction } from "../scripts/rewardTransaction";
import { getContractTransactions } from "../scripts/verifyContract";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_API_KEY;
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export default function GitHubStars() {
  const [github, setGithub] = useState({ handle: "", repo: "" });
  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState("");
  const [txid, setTxid] = useState("");
  const [transaction, setTransaction] = useState();
  const [categories, setCategories] = useState([
    {
      title: "Stars",
      name: "watchers_count",
      weighting: 0,
    },
    // {
    //   title: "Contributors",
    //   name: "",
    //   weighting: 0,
    //   count: 0,
    // },
    // {
    // title: "Commits",
    // name: "commits",
    // weighting: 0,
    // count: 0,
    // },
    {
      title: "Forks",
      name: "forks_count",
      weighting: 0,
    },
  ]);
  const [error, setError] = useState(false);
  const [log, setLog] = useState();

  // Trigger Github API selection 
  const fetchStars = async () => {
    setLoading(true);
    fetch(`https://api.github.com/repos/${github.handle}/${github.repo}`)
      .then((response) => {
        if (response.status >= 400 && response.status < 600) {
          throw new Error("Bad response from server");
        }
        return response.json();
      })
      .then((data) => {
        const totalWeighting = categories.reduce((acc, item) => {
          return acc + Number(item.weighting);
        }, 0);
        const total = categories.reduce((acc, item) => {
          return acc + data[item.name] * (item.weighting / totalWeighting);
        }, 0);

        const file = {
          metrics: categories.map((item) => {
            return {
              name: item.name,
              value: data[item.name],
              weighting: item.weighting,
            };
          }),

          calc: "weighted_sum",
          score: total,
        };

        pinFile(file);
        //@ts-ignore
        setLog(file);
      })
      .catch((error) => {
        console.log("error - sync1", error);
        setError(true);
        setLoading(false);
      });
  };
 
  // Pin File to IPFS via infura node
  const pinFile = async (file: any) => {
    try {
      const created = await client.add(JSON.stringify(file));
      setCid(created.path);
      setLoading(false);
    } catch (error) {
      //@ts-ignore
      console.log("error - sync2", error.message);
      setLoading(false);
    }
  };

  // Ping IE contract
  const submitReward = async () => {
    eventListener();
    rewardTransaction(cid);
  };

  // Ping etherscan to verify if contract exists
  const checkTransaction = async (txid:string) => {
    
    console.log("checkTransaction:", txid)
    try {
      const contractInfo = await getContractTransactions(txid);
      setTransaction(contractInfo);
    } catch (error) {
      //@ts-ignore
      console.log("contract error", error.message);
      setLoading(false);
    }
    
  }

  return (
    <div>
      {/* <button onClick={() => eventListener()}>listen</button>
      <button onClick={() => rewardTransaction()}>rewardTransaction</button> */}
      <div className="details__box !mx-auto !mt-20">
      <div className="mt-3 mb-1">IE Contract Validation</div>
        <div className="mx-10">
          <div className="flex items-center justify-between mb-1">
            <div className="font-normal">Contract address</div>
            <input
              type="text"
              value={txid}
              className="border border-[#b4aad0] max-w-[150px]"
              
              // CHANGE THIS TO CALL ETHERSCAN API
              onChange={(e) =>
                setTxid(e.target.value)
              }
            />
          </div>
      </div>
      <button
        className="relative button__box mx-auto mt-20"
        onClick={() => checkTransaction(txid)}
      >
        {loading ? (
          <>
            <div className="absolute left-5 top-[6px] w-5 h-5 border-b-2 border-[#b4aad0] rounded-full animate-spin"></div>
            Calculating
          </>
        ) : (
          "Check if exists"
        )}
      </button>
      {transaction? JSON.stringify(transaction):"no transaction"}
      </div>
      <div className="border-b-4 border-dashed border-[#9cf] my-3"></div>
      <div className="details__box !mx-auto !mt-20">
        <div className="mt-3 mb-1">Github Repo</div>
        <div className="mx-10">
          <div className="flex items-center justify-between mb-1">
            <div className="font-normal">Handle</div>
            <input
              type="text"
              value={github.handle}
              className="border border-[#b4aad0] max-w-[150px]"
              onChange={(e) =>
                setGithub((prev) => {
                  return {
                    ...prev,
                    handle: e.target.value,
                  };
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="font-normal">Repo</div>
            <input
              type="text"
              value={github.repo}
              className="border border-[#b4aad0] max-w-[150px]"
              onChange={(e) =>
                setGithub((prev) => {
                  return {
                    ...prev,
                    repo: e.target.value,
                  };
                })
              }
            />
          </div>
        </div>
        <div className="border-b-4 border-dashed border-[#9cf] my-3"></div>
        <div className="mb-1">Impact Weightings</div>
        <div className="mx-10">
          {categories.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between mb-1"
            >
              <div className="font-normal">{item.title}</div>
              <input
                type="number"
                name={item.name}
                className="border border-[#b4aad0] max-w-[55px] p-1"
                value={item.weighting}
                onChange={(e) => {
                  //@ts-ignore
                  setCategories((prev) => {
                    return prev.map((item) => {
                      if (item.name === e.target.name) {
                        return {
                          ...item,
                          weighting: e.target.value,
                        };
                      } else {
                        return item;
                      }
                    });
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <button
        className="relative button__box mx-auto mt-20"
        onClick={fetchStars}
      >
        {loading ? (
          <>
            <div className="absolute left-5 top-[6px] w-5 h-5 border-b-2 border-[#b4aad0] rounded-full animate-spin"></div>
            Calculating
          </>
        ) : (
          "Calculate Impact"
        )}
      </button>
      {error ? (
        <div>error - transaction could not be completed</div>
      ) : (
        <div className="max-w-lg">
          <p className="font-bold pt-4 pb-2 underline decoration-8 decoration-[#B4AAD0] max-w-lg ">
            {log ? `Log: ${JSON.stringify(log, null, 2)}` : null}
            <br />
            <br />
            {cid ? `CID: ${cid}` : null}
            {cid && (
              <button
                className="relative button__box mx-auto mt-20 no-underline"
                onClick={submitReward}
              >
                {loading ? (
                  <>
                    <div className="absolute left-5 top-[6px] w-5 h-5 border-b-2 border-[#b4aad0] decoration-0 rounded-full animate-spin"></div>
                    Rewarding
                  </>
                ) : (
                  "Submit to chain for reward"
                )}
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
