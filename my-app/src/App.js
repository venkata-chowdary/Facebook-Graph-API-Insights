import React from 'react';
import FacebookLogin from './components/FacebookLogin';
import './App.css'
const App = () => {
    return (
        <div className="App bg-zinc-800 w-full h-screen flex justify-center items-center">
            <FacebookLogin />
        </div>
    );
};

export default App;
