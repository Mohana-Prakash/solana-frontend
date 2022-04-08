import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import { toast } from "react-toastify";
import Header from "../header";
import solana_logo from "../assets/solana_logo.png";

function App() {
  const [cluster, setCluster] = useState("devnet");
  const [button, setButton] = useState("devnet");
  const [devtools, setDevTools] = useState("candyMachine");
  const [ID, setID] = useState();
  const [walletKey, setWalletKey] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const provider = getProvider();
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  // useEffect(() => {
  //   return program
  //     .command(name)
  //     .option(
  //       '-e, --env <string>',
  //       'Solana cluster env name',
  //       cluster, //mainnet-beta, testnet, devnet
  //     )
  //     .option(
  //       '-k, --keypair <path>',
  //       `Solana wallet location`,
  //       '--keypair not provided',
  //     )
  // }, [cluster])

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

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      try {
        const response = await solana.connect();
        setWalletKey(response.publicKey.toString());
        toast.success("Wallet connected successfully");
      } catch (err) {
        toast.error("Error while connecting to Wallet");
      }
    }
  };

  const disconnectWallet = async () => {
    const { solana } = window;
    if (walletKey && solana) {
      await solana.disconnect();
      setWalletKey(undefined);
      toast.success("Wallet Disconnected successfully");
    }
  };

  const handleChange = (e) => {
    const id = e.target.value;
    setID(e.target.value);
    if (id.length > 0) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  return (
    <>
      <Header />
      <div className="container-fluid py-4">
        <div className="w-75 m-auto">
          <div>
            {provider && !walletKey && (
              <div className="connect_wallet">
                <div style={{ width: "20%" }} className="m-auto">
                  <img className="w-100" src={solana_logo} />
                </div>
                <p className="my-3 mx-auto">Hello Solana World!</p>
                <button className="btn btn-primary" onClick={connectWallet}>
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
          <div>
            {provider && walletKey && (
              <div>
                <div className="my-3 d-flex justify-content-center align-items-center">
                  <FormControl variant="outlined" className="mr-4">
                    <InputLabel id="demo-simple-select-label">
                      Clusters
                    </InputLabel>
                    <Select
                      native
                      label="Clusters"
                      value={cluster}
                      onChange={(e) => setCluster(e.target.value)}
                      style={{ width: "200px" }}
                    >
                      <option value="devnet">devnet</option>
                      <option value="testnet">testnet</option>
                      <option value="mainnet-beta">mainnet-beta</option>
                    </Select>
                  </FormControl>
                  <FormControl variant="outlined">
                    <InputLabel id="demo-simple-select-label">
                      Devtools
                    </InputLabel>
                    <Select
                      native
                      label="Devtools"
                      value={devtools}
                      onChange={(e) => setDevTools(e.target.value)}
                      style={{ width: "200px" }}
                    >
                      <option value="candyMachine">Candy Machine</option>
                      <option value="splToken">SPL Token</option>
                    </Select>
                  </FormControl>
                </div>
                <div>
                  {devtools === "candyMachine" ? (
                    <div className="candyMachine">
                      <h1>Candy Machine Devtool</h1>
                      <div className="candy_machine_id mt-4">
                        <label>
                          Insert Candy Machine ID:
                        </label>
                        <input
                          className="form-control"
                          placeholder="Enter ID"
                          onChange={handleChange}
                          name="candyMachine"
                        />
                        {ID && (
                          <button className="btn btn-primary get_holders">
                            <Link
                              style={{ textDecoration: "none" }}
                              to={`/candy_machine/${cluster}/${ID}`}
                            >
                              Get Holders
                            </Link>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="candyMachine_spl">
                      <h1>SPL Token Devtool</h1>
                      <div className="candy_machine_spl_id mt-4">
                        <label>
                          Insert SPL Token ID:
                        </label>
                        <input
                          className="form-control"
                          placeholder="Enter ID"
                          onChange={(e) => setID(e.target.value)}
                          name="candyMachine"
                        />
                        {ID && (
                          <button className="btn btn-primary get_holders">
                            <Link
                              style={{ textDecoration: "none" }}
                              to={`/spl_token/${cluster}/${ID}`}
                            >
                              Get Holders
                            </Link>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="d-flex justify-content-center">
                  <button
                    className="btn btn-danger mt-4"
                    onClick={disconnectWallet}
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
