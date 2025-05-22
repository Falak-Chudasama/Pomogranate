import { useState, useEffect, useRef } from "react";

const POMODORO = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

function App() {
    const [isPomodoro, setIsPomodoro] = useState(true);
    const [cycles, setCycles] = useState(0);
    const [timeLeft, setTimeLeft] = useState(POMODORO);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);
    const soundRef = useRef(null);

    // Sounds
    const playSound = (src) => {
        const sound = new Audio(src);
        sound.play();
    };

    const playTimeRunningOut = () => {
        soundRef.current = new Audio("../time-running-out-sound.mp3");
        soundRef.current.play();
    };

    const stopTimeRunningOut = () => {
        if (soundRef.current) {
            soundRef.current.pause();
            soundRef.current.currentTime = 0;
        }
    };

    // Timer logic
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev === 6 && !isPomodoro) playTimeRunningOut();
                    if (prev === 1) stopTimeRunningOut();
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        handleTimerEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const handleTimerEnd = () => {
        setIsRunning(false);
        const title = isPomodoro ? "Pomodoro Done!" : "Break Over!";
        const body = isPomodoro ? "Time for a break." : "Back to work!";
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        }

        if (isPomodoro) {
            playSound("../mission-pass-sound.mp3");
            setCycles(prev => prev + 1);
        }

        setTimeout(() => {
            if (isPomodoro) {
                const nextBreak = (cycles + 1) % 4 === 0 ? LONG_BREAK : SHORT_BREAK;
                setTimeLeft(nextBreak);
                setIsPomodoro(false);
            } else {
                setTimeLeft(POMODORO);
                setIsPomodoro(true);
            }
        }, 500);
    };

    // Notification permission
    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    // Button Handlers
    const handleStartPause = () => {
        playSound("../click-sound.mp3");
        setIsRunning(prev => !prev);
        if (isRunning) stopTimeRunningOut();
    };

    const handleReset = () => {
        playSound("../click-sound.mp3");
        stopTimeRunningOut();
        clearInterval(intervalRef.current);
        setIsRunning(false);
        if (isPomodoro) {
            setTimeLeft(POMODORO);
        } else {
            setTimeLeft((cycles + 1) % 4 === 0 ? LONG_BREAK : SHORT_BREAK);
        }
    };

    const formatTime = (sec) => {
        const min = Math.floor(sec / 60);
        const remSec = sec % 60;
        return `${String(min).padStart(2, "0")}:${String(remSec).padStart(2, "0")}`;
    };

    return (
        <div className='w-full h-screen bg-palm-trees flex items-center justify-center transition-all duration-300' style={{
            backgroundBlendMode: "overlay",
            backgroundColor: "rgba(255, 0, 215, 0.3)",
            filter: "brightness(0.85)",
        }}>
            <div className='bg-pink-200/90 p-8 shadow-xl flex flex-col items-center space-y-6 max-w-sm w-full'
                style={{ clipPath: 'polygon(5% 0%, 95% 2%, 100% 95%, 2% 100%)' }}>
                <div className="text-center">
                    <h1 className="text-3xl font-pricedown text-purple-950 tracking-wide">
                        {isPomodoro ? "Pomodoro" : "Break"}
                    </h1>
                    <p className="text-md font-normal text-gray-600">
                        Cycles <span className="font-semibold text-gray-800">{cycles}</span>
                    </p>
                </div>
                <h1 className='text-6xl font-pricedown text-purple-950'>
                    {formatTime(timeLeft)}
                </h1>
                <div className="flex justify-center items-center gap-2">
                    <button
                        className={`vc-button mt-5 px-2 py-1 text-white font-semibold font-mono shadow-md transition duration-300 transform bg-pink-700 hover:bg-pink-800`}
                        onClick={handleStartPause}
                        style={{
                            clipPath: 'polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)',
                        }}>
                        {isRunning ? "Pause" : timeLeft === 0 ? (isPomodoro ? "Take Break" : "Start Pomodoro") : "Start"}
                    </button>
                    <button
                        className={`vc-button mt-5 px-2 py-1 text-white font-semibold font-mono shadow-md transition duration-300 transform bg-purple-700 hover:bg-purple-800`}
                        onClick={handleReset}
                        style={{
                            clipPath: 'polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)',
                        }}>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
