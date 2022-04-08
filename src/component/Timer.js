import React, { useEffect } from "react";
import { toast } from "react-toastify";
import WarningIcon from '@material-ui/icons/Warning';

function Timer({ over, setOver, time, setTime, setLoadBtn, loadBtn }) {

    const tick = () => {
        if (over) return;
        if (time.minutes == 0 && time.seconds == 0) {
            setOver(true);
            setLoadBtn(false)
            toast.error("Transaction Failed...!");
        } else if (time.seconds == 0)
            setTime({
                minutes: time.minutes - 1,
                seconds: 59
            });
        else
            setTime({
                minutes: time.minutes,
                seconds: time.seconds - 1
            });
    };

    // const reset = () => {
    //   setTime({
    //     minutes: parseInt(3),
    //     seconds: parseInt(0)
    //   });
    //   setOver(false);
    // };

    useEffect(() => {
        let timerID = setInterval(() => tick(), 1000);
        return () => clearInterval(timerID);
    });

    return (
        <div className="mt-4">
            <p className="text-center m-0" style={{ color: "yellow" }}>
                <WarningIcon/><span className="ml-2">Transaction will be failed in {`
                    ${time.minutes.toString().padStart(2, "0")} minutes
                    ${time.seconds.toString().padStart(2, "0")} seconds
                `}</span>
            </p>
        </div>
    );
}

export default Timer;
