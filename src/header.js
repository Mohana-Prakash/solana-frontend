import React, { useState, useEffect } from 'react'
import { gapi } from 'gapi-script'
import { GoogleLogin } from "react-google-login"
import { GoogleLogout } from "react-google-login"
import { toast } from "react-toastify";
import solana_logo from './assets/solana_logo.png'
import { Link } from 'react-router-dom';

function Header() {

    const clientId = "625209302322-bil11gtmseu92ibuidnph0usjftg0e45.apps.googleusercontent.com"
    const [button, setbutton] = useState()
    const [account_detail, setAccount_detail] = useState()

    useEffect(() => {
        function start() {
            gapi.client.init({
                clientId: clientId,
                scope: ""
            })
        }
        gapi.load('client:auth2', start)
    }, [])

    const login = (res) => {
        console.log("Login Success! current user: ", res.profileObj)
        setAccount_detail(res?.profileObj)
        if (res?.profileObj) {
            toast.success("Signed in successfully", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2000
            });
        }
        setbutton(true)
    }

    const onFailure = (res) => {
        console.log("Login failed! res: ", res)
    }

    const logout = () => {
        // console.log("Logout successfully")
        toast.success("Signed out successfully", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000
        });
        setbutton(false)
    }

    return (
        <div className='p-2 d-flex justify-content-between' style={{boxShadow: "rgb(0 0 0 / 10%) 0px 8px 32px"}}>
            <Link to='/' className='w-25 text-decoration-none d-flex align-items-center'>
                <div style={{ width:"13%" }}>
                    <img className='w-100' src={solana_logo} />
                </div>
                <h1
                    style={{
                        fontSize: "30px",
                        color: "#273852d1",
                        margin: "0px",
                        fontWeight:"700"
                    }}
                >
                    Solana Airdrop Tool
                </h1>
            </Link>
            <div className='d-flex w-25 justify-content-end align-items-center'>
                {
                    account_detail && button
                        ?
                        <div className='d-flex align-items-center'>
                            <div className='mr-2' style={{ width: "18%" }}>
                                <img style={{ width: "100%", borderRadius: "50%" }} src={account_detail?.imageUrl} />
                            </div>
                            <p style={{ color: "rgb(39, 56, 82)", margin: "0px" }}>{account_detail?.name}</p>
                        </div>
                        :
                        <div className='mr-2'>
                            <GoogleLogin
                                clientId={clientId}
                                buttonText='Signin'
                                onSuccess={login}
                                onFailure={onFailure}
                                cookiePolicy={'single_host_origin'}
                                isSignedIn={true}
                            />
                        </div>
                }
                <div>
                    {
                        button &&
                        <GoogleLogout
                            clientId={clientId}
                            buttonText={'Signout'}
                            onLogoutSuccess={logout}
                        />
                    }
                </div>
            </div>
        </div>
    )
}

export default Header