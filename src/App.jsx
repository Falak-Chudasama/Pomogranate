import { useState, useEffect, useRef } from "react";

const POMODORO = parseInt(localStorage.getItem('POMODORO')) || 60;
const SHORT_BREAK = parseInt(localStorage.getItem('SHORT_BREAK')) || 15;
const LONG_BREAK = parseInt(localStorage.getItem('LONG_BREAK')) || 30;
const LONG_BREAK_INTERVAL = parseInt(localStorage.getItem('LONG_BREAK_INTERVAL')) || 3;

function App() {
    const [pomodoro, setPomodoro] = useState(POMODORO * 60);
    const [shortBreak, setShortBreak] = useState(SHORT_BREAK * 60);
    const [longBreak, setLongBreak] = useState(LONG_BREAK * 60);

    const [isPomodoro, setIsPomodoro] = useState(() => {
        const isPomodoroSession = localStorage.getItem('isPomodoro');
        return isPomodoroSession !== null ? isPomodoroSession === 'true' : true;
    });
    const [cycles, setCycles] = useState(() => {
        const cyclesSession = localStorage.getItem('cycles');
        return cyclesSession !== null ? parseInt(cyclesSession) : 0;
    });

    const [isRunning, setIsRunning] = useState(false);
    const [keepNotifications, setKeepNotifications] = useState(() => {
        const keepNotificationsSession = localStorage.getItem('keepNotifications');
        return keepNotificationsSession !== null ? keepNotificationsSession === 'true' : true;
    });

    const [timeLeft, setTimeLeft] = useState(() => {
        let timeLeftSession = localStorage.getItem('timeLeft');
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
        const sound = new Audio(`/${src}.mp3`);
        sound.play();
    };

    const playTimeRunningOut = () => {
    };

    const stopTimeRunningOut = () => {
    };

    // side effects handlers
    useEffect(() => {
        const today = new Date().toLocaleDateString();
        const date = localStorage.getItem('date');
        if (!date || date !== today) {
            localStorage.setItem('POMODORO', POMODORO);
            localStorage.setItem('SHORT_BREAK', SHORT_BREAK);
            localStorage.setItem('LONG_BREAK', LONG_BREAK);
            localStorage.setItem('LONG_BREAK_INTERVAL', LONG_BREAK_INTERVAL);
            localStorage.setItem('isPomodoro', true);
            localStorage.setItem('cycles', 0);
            localStorage.setItem('timeLeft', pomodoro);
            localStorage.setItem('keepNotifications', keepNotifications);
            localStorage.setItem('date', today);
            setCycles(0);
            setTimeLeft(pomodoro);
            setIsPomodoro(true);
            setIsRunning(false);
        }
    }, [
        POMODORO,
        SHORT_BREAK,
        LONG_BREAK,
        LONG_BREAK_INTERVAL,
        isPomodoro,
        cycles,
        timeLeft,
        keepNotifications
    ]);
    useEffect(() => {
        localStorage.setItem('cycles', cycles);
    }, [cycles]);
    useEffect(() => {
        localStorage.setItem('timeLeft', timeLeft);
    }, [timeLeft]);
    useEffect(() => {
        localStorage.setItem('isPomodoro', isPomodoro);
    }, [isPomodoro]);

    // key events
    useEffect(() => {
        const keyUpEvent = (event) => {
            if (event.code === 'Space') {
                if (event.ctrlKey && event.altKey) {
                    event.preventDefault();
                    handleReset();
                } else {
                    console.log('Start/pause pressed');
                    event.preventDefault();
                    handleStartPause();
                }
            } else if (event.ctrlKey && event.altKey && event.code === 'KeyS' && !isPomodoro) {
                event.preventDefault();
                console.log('skip pressed');
                handleStateChange(true);
            }
        };
        window.addEventListener('keyup', keyUpEvent);
        return () => { window.removeEventListener('keyup', keyUpEvent); }
    }, [isPomodoro, cycles]);

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
                    handleTimerEnd();
                } else {
                    // if (remainingSeconds === 5 && !isPomodoro) playTimeRunningOut();
                    setTimeLeft(remainingSeconds);
                }
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, isPomodoro]);

    useEffect(() => {
        if (keepNotifications && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        localStorage.setItem('keepNotifications', keepNotifications);
    }, [keepNotifications]);


    // handlers
    const handleStateChange = (isSkip = false) => {
        setIsRunning(false);

        if (isPomodoro && !isSkip) {
            const nextBreak = (cycles + 1) % LONG_BREAK_INTERVAL === 0 ? longBreak : shortBreak;
            setTimeLeft(nextBreak);
            setIsPomodoro(false);
        } else if (!isPomodoro) {
            setCycles(prev => {
                localStorage.setItem('cycles', prev + 1);
                return prev + 1;
            });
            setTimeLeft(pomodoro);
            setIsPomodoro(true);
        }
    }

    const handleTimerEnd = () => {
        if (!isRunning) return;

        const title = isPomodoro ? "Pomodoro Done!" : "Break Over!";
        const body = isPomodoro ? "Time for a break." : "Back to work!";
        if (keepNotifications && Notification.permission === "granted") {
            new Notification(title, { body });
        }

        handleStateChange();
    };

    // Button Handlers
    const handleStartPause = () => {
        playSound("../click-sound.mp3");
        setIsRunning(prev => !prev);
    };

    const handleReset = () => {
        playSound("../click-sound.mp3");
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
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
            <div className='bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-2xl flex flex-col items-center space-y-6 max-w-sm w-full'>
                
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isPomodoro ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                        <h1 className="text-xl font-medium text-white">
                            {isPomodoro ? "Focus Time" : "Break Time"}
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="text-sm">Cycle</span>
                        <span className="bg-gray-700 px-2 py-1 rounded text-sm text-white">
                            {cycles}
                        </span>
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-6xl font-bold text-white font-mono mb-2">
                        {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-gray-400">
                        {isRunning ? 'RUNNING' : 'PAUSED'}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        className={`px-6 py-3 font-medium rounded-lg transition-colors duration-200 ${
                            isRunning 
                                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        onClick={handleStartPause}>
                        {isRunning ? "Pause" : "Start"}
                    </button>
                    
                    <button
                        className="px-6 py-3 font-medium rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200"
                        onClick={handleReset}>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;