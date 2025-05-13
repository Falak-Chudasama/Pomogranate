import { useState, useEffect } from 'react';

const pomodoroTime = 25 * 60;
const shortBreakTime = 5 * 60;
const longBreakTime = 15 * 60;

function App() {
    const [isPause, setPause] = useState(false);
    const [timer, setTimer] = useState(pomodoroTime);
    const [isPomodoro, setPomodoro] = useState(true);
    const [cycles, setCycles] = useState(0);

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

    // const playSound = () => {
    //     const sound = new Audio('../assets/audio.mp3');
    //     sound.play();
    // };

    useEffect(() => {
        let interval = null;
        if (!isPause && timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }

        if (!isPause && timer === 0) {
            setPause(true);
            showNotification(
                isPomodoro ? "Pomodoro Complete!" : "Break Over!",
                isPomodoro ? "Time to take a short break." : "Time to get back to work!"
            );
            // playSound();
        }

        return () => clearInterval(interval);
    }, [isPause, timer, isPomodoro]);


    const switchToBreak = () => {
        setPause(false);
        setPomodoro(false);
        setCycles(cycle => {
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
        if (timer === 0) {
            if (isPomodoro) {
                switchToBreak();
            } else {
                switchToPomo();
            }
        }
        setPause(true);
    }

    const handleResume = () => {
        setPause(false);
    }

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    return (
        <div className='w-full h-screen bg-gradient-to-br from-red-100 to-pink-200 flex items-center justify-center'>
            <div className='bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center space-y-6 max-w-sm w-full'>
                <h1 className="text-3xl font-bold text-gray-800 tracking-wide">
                    {isPomodoro ? "Pomodoro" : "Break"}
                </h1>
                <p className="text-md text-gray-600 font-medium">
                    Completed Cycles: <span className="font-semibold text-gray-800">{cycles}</span>
                </p>
                <h1 className='text-6xl font-mono text-gray-900'>
                    {formatTime(timer)}
                </h1>
                <button 
                    className={`mt-5 px-4 py-1 text-white font-semibold rounded-2xl shadow-md transition duration-300 ${!isPause ? "bg-red-500 hover:bg-red-600" : timer === 0 ? isPomodoro ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}`} 
                    onClick={!isPause ? handlePause : timer === 0 ? isPomodoro ? switchToBreak : switchToPomo : handleResume}>
                    {!isPause ? "Pause" : timer === 0 ? isPomodoro ? "Take Break" : "Do Pomodoro" : "Resume"}
                </button>
            </div>
        </div>
    );
}

export default App;