import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Modal from "./modal";
import Checkbox from "@material-ui/core/Checkbox";
import { toast } from "react-toastify";
import Header from "../header";
import Timer from "./Timer.js";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import bs58 from "bs58";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  getMint,
} from "@solana/spl-token";

import Loaders from "./loader";
import { LoaderContext } from "./loadercontext";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import Loading_gif from "../assets/loading.gif";
const { Token } = require("@solana/spl-token");
const splToken = require("@solana/spl-token");
const web3 = require("@solana/web3.js");
const spl = require("@solana/spl-token");

window.Buffer = window.Buffer || require("buffer").Buffer;
const Buffer = require('buffer').Buffer

function CandyMachine() {
  const { id, cluster } = useParams();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [text, setText] = useState();
  const [item, setItem] = useState();
  const [itemIndex, setItemIndex] = useState();
  const [candyMachineReceiverId, setCandyMachineReceiverId] = useState([]);
  const [candyMachineUniquwIds, setCandyMachineUniquwIds] = useState([]);
  const [sol, setSOL] = useState();
  const [dummyIds, setDummyIds] = useState([]);
  const [multiAdd, setMultiAdd] = useState([]);
  const [transferMethod, setTransferMethod] = useState("Sol");
  const [noOfTokens, setNoOfTokens] = useState("");
  const [TokenAddress, setTokenAddress] = useState("");
  const connection = new Connection(clusterApiUrl(cluster));
  const { setLoading } = useContext(LoaderContext);
  const [loadBtn, setLoadBtn] = useState(false);
  const [over, setOver] = React.useState(false);
  const [time, setTime] = React.useState({
    minutes: parseInt(3),
    seconds: parseInt(0)
  });
  const [signature, setSignature] = useState()
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const provider = getProvider();
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  const MAX_NAME_LENGTH = 32;
  const MAX_URI_LENGTH = 200;
  const MAX_SYMBOL_LENGTH = 10;
  const MAX_CREATOR_LEN = 32 + 1 + 1;
  const MAX_CREATOR_LIMIT = 5;
  const MAX_DATA_SIZE =
    4 +
    MAX_NAME_LENGTH +
    4 +
    MAX_SYMBOL_LENGTH +
    4 +
    MAX_URI_LENGTH +
    2 +
    1 +
    4 +
    MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
  const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172;
  const CREATOR_ARRAY_START =
    1 +
    32 +
    32 +
    4 +
    MAX_NAME_LENGTH +
    4 +
    MAX_URI_LENGTH +
    4 +
    MAX_SYMBOL_LENGTH +
    2 +
    1 +
    4;
  const TOKEN_METADATA_PROGRAM = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  const CANDY_MACHINE_V2_PROGRAM = new PublicKey(
    "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"
  );

  const getMintAddresses = async (firstCreatorAddress) => {
    const metadataAccounts = await connection.getProgramAccounts(
      TOKEN_METADATA_PROGRAM,
      {
        // The mint address is located at byte 33 and lasts for 32 bytes.
        dataSlice: { offset: 33, length: 32 },

        filters: [
          // Only get Metadata accounts.
          { dataSize: MAX_METADATA_LEN },

          // Filter using the first creator.
          {
            memcmp: {
              offset: CREATOR_ARRAY_START,
              bytes: firstCreatorAddress.toBase58(),
            },
          },
        ],
      }
    );
    return metadataAccounts.map((metadataAccountInfo) =>
      bs58.encode(metadataAccountInfo.account.data)
    );
  };

  const getCandyMachineCreator = async (candyMachine) =>
    await PublicKey.findProgramAddress(
      [Buffer.from("candy_machine"), candyMachine.toBuffer()],
      CANDY_MACHINE_V2_PROGRAM
    );

  useEffect(async () => {
    setLoading(true);
    let listofIds = [];
    const candyMachineId = new PublicKey(id);
    const candyMachineCreator = await getCandyMachineCreator(candyMachineId);
    let getMintAddressesData = await getMintAddresses(candyMachineCreator[0]);
    for (const item of getMintAddressesData) {
      const tokenMint = item;
      const largestAccounts = await connection.getTokenLargestAccounts(
        new PublicKey(tokenMint)
      );
      const largestAccountInfo = await connection.getParsedAccountInfo(
        largestAccounts?.value[0]?.address
      );
      listofIds.push({ ...largestAccountInfo });
      setLoading(false);
    }
    setCandyMachineReceiverId([...listofIds]);
  }, []);

  useEffect(() => {
    if (candyMachineReceiverId?.length > 0) {
      setLoading(true);
      const list = candyMachineReceiverId.slice();
      let idList = list.map((item, i) => {
        return item.value?.data?.parsed?.info?.owner;
      });
      let set = [...new Set(idList)];
      const newData = set.map((item, i) => {
        let length = idList.filter((x) => x === item).length;
        let obj = {
          id: item,
          amount: length,
        };
        return obj;
      });
      setCandyMachineUniquwIds([...newData]);
      setDummyIds([...newData]);
      setLoading(false);
    }
  }, [candyMachineReceiverId]);

  async function sendAirDrop(connection, provider) {
    setLoadBtn(true);
    setLoading(true);
    const instructions = [];

    for (const item of candyMachineUniquwIds) {
      var recieverWallet = new web3.PublicKey(item.id);

      instructions.push(
        web3.SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: recieverWallet,
          lamports:
            web3.LAMPORTS_PER_SOL * parseFloat(sol) * parseFloat(item.amount), //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
        })
      );
    }
    var transaction = new web3.Transaction().add(...instructions);

    // Setting the variables for the transaction
    transaction.feePayer = await provider?.publicKey;
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;

    // Transaction constructor initialized successfully

    if (transaction) {
      toast.success("Transaction created successfully");
    }

    // Request creator to sign the transaction (allow the transaction)
    let signed = await provider?.signTransaction(transaction);

    // The signature is generated
    let signature = await connection.sendRawTransaction(signed?.serialize());
    // Confirm whether the transaction went through or not
    await connection.confirmTransaction(signature);

    if (signature) {
      setLoading(false);
      setLoadBtn(false);
      toast.success("Transaction completed successfully");
    }
  }

  const getProvider = async () => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        return provider;
      }
    } else {
      window.open("https://www.phantom.app/", "_blank");
    }
  };

  async function transferSOL() {
    var provider = await getProvider();
    var connection = new web3.Connection(web3.clusterApiUrl(cluster));
    sendAirDrop(connection, provider);
  }

  const addWalletID = () => {
    const myArray = text.split(",");
    let data = myArray.map((a) => {
      return {
        id: a,
        amount: 1,
      };
    });
    setAddModal(false);
    setCandyMachineUniquwIds([...candyMachineUniquwIds, ...data]);
    setDummyIds([...dummyIds, ...data]);
  };

  const handleChange = (e) => {
    setItem({ ...item, id: e.target.value });
  };

  const handleSelect = (e, i) => {
    let selectdata = candyMachineUniquwIds.map((item, j) => {
      if (j === i) {
        item.checked = item.checked ? !item.checked : true;
      }
      return item;
    });
    setCandyMachineUniquwIds([...selectdata]);
    setDummyIds([...selectdata]);
  };

  const handleDelete = () => {
    let array = candyMachineUniquwIds?.filter((e) => e.checked !== true);
    setCandyMachineUniquwIds(array);
    setDummyIds(array);
  };

  const handleEdit = (e, i) => {
    setEditModal(true);
    setItem(e);
    setItemIndex(i);
  };

  const handleUpdate = () => {
    const updateArr = candyMachineUniquwIds?.map((e, i) =>
      i === itemIndex ? item : e
    );
    setCandyMachineUniquwIds(updateArr);
    setDummyIds(updateArr);
    setEditModal(false);
  };

  const searchWalletID = (e) => {
    let wID = e.target.value;
    if (wID === "") {
      setCandyMachineUniquwIds(dummyIds);
    }
    const searchId = dummyIds?.filter((item) => {
      return item.id.toLowerCase().indexOf(wID.toLowerCase()) !== -1;
    });
    setCandyMachineUniquwIds([...searchId]);
  };

  const transferToken = async () => {
    setLoadBtn(true);
    var provider = await getProvider();
    if (!provider.publicKey) {
      toast.error("Wallet disconnected...! Please connect to wallet");
    }
    let secretKey = Uint8Array.from(process.env.REACT_APP_SECRET_KEY.split(','));

    const myKeypair = web3.Keypair.fromSecretKey(secretKey);

    const fromWallet = myKeypair;

    const tokenM = new web3.PublicKey(TokenAddress);
    try {
      for (const item of candyMachineUniquwIds) {
        const addressOfreceiver = item.id;
        var recieverWallet = await new web3.PublicKey(addressOfreceiver);
        const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
          connection,
          fromWallet.publicKey,
          tokenM,
          fromWallet.publicKey
        );

        const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
          connection,
          fromWallet.publicKey,
          tokenM,
          recieverWallet
        );

        let signature = await splToken.transfer(
          connection,
          fromWallet,
          fromTokenAccount.address,
          toTokenAccount.address,
          fromWallet.publicKey,
          noOfTokens
        );
        setSignature(signature)

        if (signature) {
          setLoadBtn(false);
          setTime({
            minutes: parseInt(),
            seconds: parseInt(10)
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Header />
      <Loaders />
      <div className="container py-4">
        <h1 className="mb-4" style={{ fontSize: "40px", color: "#273852d1" }}>
          Candy Machine
        </h1>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="w-50">
            <input
              className="form-control "
              placeholder="Search Wallet ID"
              onChange={searchWalletID}
              name="candyMachine"
            />
          </div>
          <div className="w-25" style={{ textAlign: "end" }}>
            <button
              type="button"
              className="btn btn-primary mr-2"
              data-toggle="modal"
              data-target="#updatetask"
              data-backdrop="static"
              onClick={() => setAddModal(true)}
            >
              Add Wallet ID
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>

        <table className="user_table text-center">
          <thead>
            <tr>
              <th style={{ width: "6%" }}>
                <Checkbox style={{ color: "white" }} disabled indeterminate />
              </th>
              <th style={{ width: "74%" }}>Wallet ID</th>
              <th style={{ width: "10%" }}>Amount</th>
              <th style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candyMachineUniquwIds?.map((e, i) => {
              return (
                <tr key={i}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={e.checked}
                      value={e.checked}
                      onChange={(e) => handleSelect(e, i)}
                    />
                  </td>
                  <td>{e?.id}</td>
                  <td>{e?.amount}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-toggle="modal"
                      data-target="#updatetask"
                      data-backdrop="static"
                      onClick={() => handleEdit(e, i)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="d-flex justify-content-end align-items-center">
          <div className="my-4">
            <FormControl variant="outlined">
              <InputLabel id="demo-simple-select-label">Transfer</InputLabel>
              <Select
                native
                label="transferMethod"
                value={transferMethod}
                onChange={(e) => setTransferMethod(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="Sol">Sol</option>
                <option value="Token">Token</option>
              </Select>
            </FormControl>
          </div>
        </div>
        {transferMethod === "Sol" ? (
          <div className="container">
            <div className="candy_machine_id d-flex justify-content-around">
              <div
                className="d-flex align-items-center"
                style={{ width: "60%" }}
              >
                <label className="m-0 w-25">
                  Send Sol :
                </label>
                <input
                  className="form-control ml-4 w-75"
                  placeholder="Enter Sol"
                  onChange={(e) => setSOL(e.target.value)}
                  name="candyMachine"
                  style={{ width: "40%" }}
                />
              </div>
              {sol &&
                <div className="d-flex" style={{ width: "35%" }}>
                  <button
                    className="btn btn-primary w-100"
                    onClick={transferSOL}
                  >
                    {loadBtn ? "Sending SOL..." : "Send SOL"}
                  </button>
                  {loadBtn && (
                    <div className="ml-4">
                      <img width={40} src={Loading_gif} />
                    </div>
                  )}
                </div>
              }
            </div>
          </div>
        ) : (
          <div className="candy_machine_id">
            <div>
              <div className="d-flex">
                <label className="m-0 w-25">
                  Token Id :
                </label>
                <input
                  className="form-control mx-2 w-75"
                  placeholder="Enter Token Id"
                  onChange={(e) => setTokenAddress(e.target.value)}
                  name="trasferToken"
                  style={{ width: "40%" }}
                />
              </div>
              <div className="d-flex mt-4">
                <label className="m-0 w-25">
                  No of Tokens :
                </label>
                <input
                  className="form-control ml-2 w-75"
                  placeholder="Enter No Tokens"
                  onChange={(e) => setNoOfTokens(e.target.value)}
                  name="noOfTokens"
                  style={{ width: "20%" }}
                />
              </div>
            </div>
            <div className="mt-4 d-flex justify-content-center">
              <button className="w-100 btn btn-primary" onClick={transferToken}>
                {loadBtn ? "Sending Token..." : "Send Token"}
              </button>
              {loadBtn && (
                <div className="ml-4">
                  <img width={40} src={Loading_gif} />
                </div>
              )}
            </div>
            <div>
              {
                loadBtn &&
                <Timer
                  over={over}
                  setOver={setOver}
                  time={time}
                  setTime={setTime}
                  setLoadBtn={setLoadBtn}
                  loadBtn={loadBtn}
                />
              }
            </div>
            {
              signature &&
              <p className="text-center mt-4" style={{ color: "chartreuse" }}>
                Transaction Successful...
                <span><CheckCircleIcon /></span>
              </p>
            }
          </div>
        )}
      </div>
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        footer={false}
        title={"Add Wallet ID"}
        closeButton={false}
        content={
          <>
            <div>
              <label>Wallet ID :</label>
              <input
                type="textarea"
                className="form-control"
                placeholder="Enter ID"
                onChange={(e) => setText(e.target.value)}
                name="candyMachine"
              />
            </div>
            <div className="mt-3 w-100 modal-btn">
              <button className="btn btn-success mr-3" onClick={addWalletID}>
                Add
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setAddModal(false)}
              >
                Close
              </button>
            </div>
          </>
        }
      />
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        footer={false}
        title={"Edit Wallet ID"}
        closeButton={false}
        content={
          <>
            <div>
              <label>Wallet ID :</label>
              <input
                className="form-control"
                placeholder="Enter ID"
                value={item?.id}
                onChange={handleChange}
                name="candyMachine"
              />
            </div>
            <div className="mt-3 w-100 modal-btn">
              <button className="btn btn-success mr-3" onClick={handleUpdate}>
                Submit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setEditModal(false)}
              >
                Close
              </button>
            </div>
          </>
        }
      />
    </>
  );
}

export default CandyMachine;
