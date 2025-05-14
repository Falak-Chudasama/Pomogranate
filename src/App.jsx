import { useState, useEffect } from "react";

const pomodoroTime = 25 * 60;
const shortBreakTime = 5 * 60;
const longBreakTime = 15 * 60;

function App() {
    const [isPause, setPause] = useState(true);
    const [timer, setTimer] = useState(pomodoroTime);
    const [isPomodoro, setPomodoro] = useState(true);
    const [cycles, setCycles] = useState(0);
    const [timeRunningOutSound, setTimeRunningOutSound] = useState(null);

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    const showNotification = (title, body) => {
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        }
    };

    const missionPassedSound = () => {
        const sound = new Audio("../mission-pass-sound.mp3");
        sound.play();
    };

    const clickSound = () => {
        const sound = new Audio("../click-sound.mp3");
        sound.play();
    };

    const playTimeRunningOutSound = () => {
        const sound = new Audio("../time-running-out-sound.mp3");
        setTimeRunningOutSound(sound);
        sound.play();
    };

    const stopTimeRunningOutSound = () => {
        timeRunningOutSound.pause();
    };

    useEffect(() => {
        let interval = null;

        if (!isPomodoro && timer === 5) {
            playTimeRunningOutSound();
        }

        if (!isPause && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }

        if (!isPause && timer === 0) {
            setPause(true);
            showNotification(
                isPomodoro ? "Mission Passed!" : "Break Over!",
                isPomodoro ? "Time to take a short break." : "Time to get back to work!"
            );
            if (isPomodoro) {
                missionPassedSound();
            }
            if (timeRunningOutSound) {
                stopTimeRunningOutSound();
            }
        }

        return () => clearInterval(interval);
    }, [isPause, timer, isPomodoro]);

    const handleButtonClick = () => {
        clickSound();

        if (!isPause) {
            handlePause();
        } else if (timer === 0) {
            if (isPomodoro) {
                switchToBreak();
            } else {
                switchToPomo();
            }
        } else {
            handleResume();
        }
    }

    const switchToBreak = () => {
        setPause(false);
        setPomodoro(false);
        setCycles((cycle) => {
            if (cycle === 3) {
                setTimer(longBreakTime);
                return 0;
            }
            setTimer(shortBreakTime);
            return cycle + 1;
        });
    };

    const switchToPomo = () => {
        setPause(false);
        setPomodoro(true);
        setTimer(pomodoroTime);
    };

    const handlePause = () => {
        if (timeRunningOutSound) {
            stopTimeRunningOutSound();
        }
        if (timer === 0) {
            if (isPomodoro) {
                switchToBreak();
            } else {
                switchToPomo();
            }
        }
        setPause(true);
    };

    const handleResume = () => {
        setPause(false);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2,"0")}`;
    };

    return (
        <div className='w-full h-screen bg-palm-trees flex items-center justify-center' style={{
            backgroundBlendMode: "overlay",
            backgroundColor: "rgba(255, 0, 215, 0.3)",
            filter: "brightness(0.85)",
        }}>
            <div className='bg-pink-200/90 p-8 shadow-xl flex flex-col items-center space-y-6 max-w-sm w-full' 
            style={{
                clipPath: 'polygon(5% 0%, 95% 2%, 100% 95%, 2% 100%)',
            }}>
                <div className="text-center">
                    <h1 className="text-3xl font-pricedown text-purple-950 tracking-wide">
                        {isPomodoro ? "Pomodoro" : "Break"}
                    </h1>
                    <p className="text-md font-normal text-gray-600">
                        Cycles <span className="font- text-gray-800">{cycles}</span>
                    </p>
                </div>
                <h1 className='text-6xl font-pricedown text-purple-950'>
                    {formatTime(timer)}
                </h1>
                <button
                    // className={`vc-button mt-5 px-4 py-1 text-white font-semibold font-mono shadow-md transition duration-300 ${ isPomodoro && timer === pomodoroTime ? "bg-green-500 hover:bg-green-600" : !isPause ? "bg-red-500 hover:bg-red-600" : timer === 0 ? isPomodoro ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}`}
                    className={`vc-button mt-5 px-4 py-1 text-white font-semibold font-mono shadow-md transition duration-300 transform bg-pink-700 hover:bg-pink-800`}
                    onClick={ handleButtonClick }
                    style={{
                        clipPath: 'polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)',
                    }}>
                    { isPomodoro && timer === pomodoroTime ? "Start Pomodoro" : !isPause ? "Pause" : timer === 0 ? isPomodoro ? "Take Break" : "Start Pomodoro" : "Resume" }
                </button>
            </div>
        </div>
    );
}

export default App;
