import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Modal from "./modal";
import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import Checkbox from "@material-ui/core/Checkbox";
import { toast } from "react-toastify";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import Loading_gif from "../assets/loading.gif";
import bs58 from "bs58";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import axios from "axios";
import Loaders from "./loader";
import { LoaderContext } from "./loadercontext";
import Header from "../header";
import Timer from "./Timer.js";

window.Buffer = window.Buffer || require("buffer").Buffer;

// const tokenValues = [
//   "9UJXKUHDZ2hU7MhwpFeriF6KLYXuadijiejMA5gPFjz5",
//   "AGhWbzg2e65si3XueFEyFZuurThkfJW3h2FGPWrVc4QP",
//   "TGY6ajyXBnNoBsrFYBoYqQ1w98zrEtNCzCmRN1ymHfR",
// ];

function SPLToken() {
  const { id, cluster } = useParams();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [text, setText] = useState();
  const [item, setItem] = useState();
  const [itemIndex, setItemIndex] = useState();
  const [sol, setSOL] = useState();
  const [loadBtn, setLoadBtn] = useState(false);
  const connection = new Connection(clusterApiUrl(cluster));
  const [specialTokenAdresses, setSpecialTokenAdresses] = useState([]);
  const [uniqueTokenAdresses, setuniqueTokenAdresses] = useState([]);
  const [sqltransferMethod, setSqlTransferMethod] = useState("Sol");
  const [sqlnoOfTokens, setSqlNoOfTokens] = useState("");
  const [sqlTokenAddress, setSqlTokenAddress] = useState("");
  const [over, setOver] = React.useState(false);
  const [time, setTime] = React.useState({
    minutes: parseInt(3),
    seconds: parseInt(0)
  });
  const [signature, setSignature] = useState()
  const { Token } = require("@solana/spl-token");
  const spl = require("@solana/spl-token");
  const [searchToekns, setSearchToekns] = useState([]);
  const { setLoading } = useContext(LoaderContext);
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

  useEffect(async () => {
    setLoading(true);
    if (cluster === "devnet") {
      gettingReceiverIdsBySpecialToken();
    } else {
      gettingReceiverIdsBySpecialTokenbyMainnet();
    }
  }, []);

  const gettingReceiverIdsBySpecialToken = () => {
    try {
      axios
        .post(`http://api.${cluster}.solana.com`, {
          jsonrpc: "2.0",
          id: 1,
          method: "getProgramAccounts",
          params: [
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            {
              encoding: "jsonParsed",
              filters: [
                {
                  dataSize: 165,
                },
                {
                  memcmp: {
                    offset: 0,
                    bytes: id,
                  },
                },
              ],
            },
          ],
        })
        .then((res) => {
          setSpecialTokenAdresses([...res?.data?.result]);
          setSearchToekns([...res?.data?.result]);
          setLoading(false);
        });
    } catch (error) { }
    setLoading(false);
  };

  const gettingReceiverIdsBySpecialTokenbyMainnet = () => {
    try {
      axios
        .post(`https://api.${cluster}.solana.com`, {
          jsonrpc: "2.0",
          id: 1,
          method: "getProgramAccounts",
          params: [
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            {
              encoding: "jsonParsed",
              filters: [
                {
                  dataSize: 165,
                },
                {
                  memcmp: {
                    offset: 0,
                    bytes: id,
                  },
                },
              ],
            },
          ],
        })
        .then((res) => {
          setSpecialTokenAdresses([...res?.data?.result]);
          setSearchToekns([...res?.data?.result]);
          setLoading(false);
        });
    } catch (error) { }
  };

  async function transferSOLusingToken() {
    setLoading(true);
    var provider = await getProvider();
    var connection = new web3.Connection(web3.clusterApiUrl(cluster));

    specialTokenTransaction(connection, provider);

    // I have hardcoded my secondary wallet address here. You can take this address either from user input or your DB or wherever
  }

  async function specialTokenTransaction(connection, provider) {
    setLoading(true);
    const instructions = [];

    for (const item of specialTokenAdresses) {
      const addressOfreceiver = item?.account?.data?.parsed?.info?.owner;
      const uiamount = item?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;

      var recieverWallet = await new web3.PublicKey(addressOfreceiver);

      instructions.push(
        web3.SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: recieverWallet,
          lamports: web3.LAMPORTS_PER_SOL * parseFloat(sol) * uiamount, //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
        })
      );
    }

    var transaction = await new web3.Transaction().add(...instructions);

    // Setting the variables for the transaction
    transaction.feePayer = await provider?.publicKey;
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;

    // Transaction constructor initialized successfully
    if (transaction) {
      toast.success("Txn created successfully");
    }

    // Request creator to sign the transaction (allow the transaction)
    let signed = await provider?.signTransaction(transaction);
    // The signature is generated
    let signature = await connection.sendRawTransaction(signed?.serialize());
    // Confirm whether the transaction went through or not
    await connection.confirmTransaction(signature);
    if (signature) {
      setLoading(false);
      toast.success("transaction completed successfully");
    }

    //Signature chhap diya idhar dhekooo
  }

  useEffect(() => {
    if (specialTokenAdresses?.length > 0) {
      let idList = specialTokenAdresses.map((item, i) => {
        let obj = {
          id: item?.account?.data?.parsed?.info?.owner,
          amount: item?.account?.data?.parsed?.info?.tokenAmount?.uiAmount,
        };
        return obj;
      });

      setuniqueTokenAdresses([...idList]);
      setSearchToekns([...idList]);
    }
  }, [specialTokenAdresses]);

  const addWalletID = () => {
    const myArray = text.split(",");
    let data = myArray.map((a) => {
      return {
        id: a,
        amount: 1,
      };
    });
    setAddModal(false);
    setuniqueTokenAdresses([...uniqueTokenAdresses, ...data]);
    setSearchToekns([...searchToekns, ...data]);
  };

  const handleChange = (e) => {
    setItem({ ...item, id: e.target.value });
  };

  const handleSelect = (e, i) => {
    uniqueTokenAdresses[i].checked = e.target.checked;
  };

  const handleDelete = () => {
    let array = uniqueTokenAdresses?.filter((e) => e.checked !== true);
    setuniqueTokenAdresses(array);
    setSearchToekns(array);
  };

  const handleEdit = (e, i) => {
    setEditModal(true);
    setItem(e);
    setItemIndex(i);
  };

  const handleUpdate = () => {
    const updateArr = uniqueTokenAdresses?.map((e, i) =>
      i === itemIndex ? item : e
    );
    setuniqueTokenAdresses(updateArr);
    setSearchToekns(updateArr);
    setEditModal(false);
  };

  const searchWalletID = (e) => {
    let wID = e.target.value;
    if (wID === "") {
      setuniqueTokenAdresses(searchToekns);
    }
    const searchId = searchToekns?.filter((item) => {
      return item.id.toLowerCase().indexOf(wID.toLowerCase()) !== -1;
    });
    setuniqueTokenAdresses([...searchId]);
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

    const tokenM = new web3.PublicKey(sqlTokenAddress);

    try {
      for (const item of uniqueTokenAdresses) {
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
          sqlnoOfTokens
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
  }

  return (
    <>
      <Header />
      <Loaders />
      <div className="container py-4">
        <h1 className="mb-4" style={{ fontSize: "40px", color: "darkcyan" }}>
          SPL Token
        </h1>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="w-50">
            <input
              className="form-control"
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

        <table className="user_table">
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
            {uniqueTokenAdresses?.map((e, i) => {
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
                  <td> {e?.id}</td>
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
                value={sqltransferMethod}
                onChange={(e) => setSqlTransferMethod(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="Sol">Sol</option>
                <option value="Token">Token</option>
              </Select>
            </FormControl>
          </div>
        </div>
        {sqltransferMethod === "Sol" ? (
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
              {sol && (
                <div className="d-flex" style={{ width: "35%" }}>
                  <button
                    className="btn btn-primary w-100"
                    onClick={transferSOLusingToken}
                  >
                    {loadBtn ? "Sending SOL..." : "Send SOL"}
                  </button>
                  {loadBtn && (
                    <div className="ml-4">
                      <img width={40} src={Loading_gif} />
                    </div>
                  )}
                </div>
              )}
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
                  className="form-control w-75"
                  placeholder="Enter Token Id"
                  onChange={(e) => setSqlTokenAddress(e.target.value)}
                  name="trasferToken"
                  style={{ width: "40%" }}
                />
              </div>
              <div className="d-flex mt-4">
                <label className="m-0 w-25">
                  No of Tokens :
                </label>
                <input
                  className="form-control w-75"
                  placeholder="Enter No Tokens"
                  onChange={(e) => setSqlNoOfTokens(e.target.value)}
                  name="noOfTokens"
                  style={{ width: "20%" }}
                />
              </div>
            </div>
            <div className="mt-4 d-flex justify-content-end">
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

export default SPLToken;
