import { useState, useEffect, useRef } from "react";

const POMODORO = parseInt(sessionStorage.getItem('POMODORO')) || 40;
const SHORT_BREAK = parseInt(sessionStorage.getItem('SHORT_BREAK')) || 5;
const LONG_BREAK = parseInt(sessionStorage.getItem('LONG_BREAK')) || 15;
const LONG_BREAK_INTERVAL = parseInt(sessionStorage.getItem('LONG_BREAK_INTERVAL')) || 3;

function App() {
    const [pomodoro, setPomodoro] = useState(POMODORO * 60);
    const [shortBreak, setShortBreak] = useState(SHORT_BREAK * 60);
    const [longBreak, setLongBreak] = useState(LONG_BREAK * 60);

    const [isPomodoro, setIsPomodoro] = useState(() => {
        const isPomodoroSession = sessionStorage.getItem('isPomodoro');
        return isPomodoroSession !== null ? isPomodoroSession === 'true' : true;
    });
    const [cycles, setCycles] = useState(() => {
        const cyclesSession = sessionStorage.getItem('cycles');
        return cyclesSession !== null ? parseInt(cyclesSession) : 0;
    });

    const [isRunning, setIsRunning] = useState(false);
    const [keepNotifications, setKeepNotifications] = useState(() => {
        const keepNotificationsSession = sessionStorage.getItem('keepNotifications');
        return keepNotificationsSession !== null ? keepNotificationsSession === 'true' : true;
    });

    const [timeLeft, setTimeLeft] = useState(() => {
        let timeLeftSession = sessionStorage.getItem('timeLeft');
        if (timeLeftSession === null) {
            return isPomodoro ? pomodoro : cycles % LONG_BREAK_INTERVAL === 0 ? longBreak : shortBreak;
        }

        timeLeftSession = parseInt(timeLeftSession);
        if (isPomodoro) {
            return timeLeftSession;
        } else if (cycles % 4 === 0) {
            return timeLeftSession;
        } else {
            return timeLeftSession;
        }
    });

    const soundRef = useRef(null);
    const intervalRef = useRef(null);

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

    useEffect(() => {
        sessionStorage.setItem('cycles', cycles);
    }, [cycles]);
    useEffect(() => {
        sessionStorage.setItem('timeLeft', timeLeft);
    }, [timeLeft]);
    useEffect(() => {
        sessionStorage.setItem('isPomodoro', isPomodoro);
    }, [isPomodoro]);

    // Timer logic
    useEffect(() => {
        if (isRunning) {
            const startTime = Date.now();
            const endTime = startTime + timeLeft * 1000;

            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const remainingSeconds = Math.round((endTime - now) / 1000);

                if (remainingSeconds <= 0) {
                    clearInterval(intervalRef.current);
                    stopTimeRunningOut();
                    handleTimerEnd();
                    setTimeLeft(0);
                } else {
                    if (remainingSeconds === 5 && !isPomodoro) playTimeRunningOut();
                    setTimeLeft(remainingSeconds);
                }
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, isPomodoro]);

    const handleTimerEnd = () => {
        if (!isRunning) return;

        setIsRunning(false);
        const title = isPomodoro ? "Pomodoro Done!" : "Break Over!";
        const body = isPomodoro ? "Time for a break." : "Back to work!";
        if (keepNotifications && Notification.permission === "granted") {
            new Notification(title, { body });
        }

        if (isPomodoro) {
            playSound("../mission-pass-sound.mp3");
            const nextBreak = (cycles + 1) % LONG_BREAK_INTERVAL === 0 ? longBreak : shortBreak;
            setTimeLeft(nextBreak);
            setIsPomodoro(false);
        } else {
            setCycles(prev => {
                sessionStorage.setItem('cycles', prev + 1);
                return prev + 1;
            });
            setTimeLeft(pomodoro);
            setIsPomodoro(true);
        }
    };

    useEffect(() => {
        if (keepNotifications && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        sessionStorage.setItem('keepNotifications', keepNotifications);
    }, [keepNotifications]);

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
            setTimeLeft(pomodoro);
        } else {
            setTimeLeft((cycles + 1) % LONG_BREAK_INTERVAL === 0 ? longBreak : shortBreak);
        }
    };

    const formatTime = (sec) => {
        const min = Math.floor(sec / 60);
        const remSec = sec % 60;
        return `${String(min).padStart(2, "0")}:${String(remSec).padStart(2, "0")}`;
    };

    return (
        <div className='w-full h-screen bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center transition-all duration-300'>
            <div className='bg-pink-200/90 p-8 rounded-xl shadow-xl flex flex-col items-center space-y-6 max-w-sm w-full'>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-purple-950 tracking-wide">
                        {isPomodoro ? "Pomodoro" : "Break"}
                    </h1>
                    <p className="text-md font-normal text-gray-600">
                        Cycles <span className="font-semibold text-gray-800">{cycles}</span>
                    </p>
                </div>
                <h1 className='text-6xl font-bold text-purple-950'>
                    {formatTime(timeLeft)}
                </h1>
                <div className="flex justify-center items-center gap-4">
                    <button
                        className={`px-6 py-3 text-white font-semibold rounded-lg shadow-md transition duration-300 transform hover:scale-105 bg-pink-600 hover:bg-pink-700`}
                        onClick={handleStartPause}>
                        {isRunning ? "Pause" : "Start"}
                    </button>
                    <button
                        className={`px-6 py-3 text-white font-semibold rounded-lg shadow-md transition duration-300 transform hover:scale-105 bg-purple-600 hover:bg-purple-700`}
                        onClick={handleReset}>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;