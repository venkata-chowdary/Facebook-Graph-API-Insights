import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';

const FacebookLogin = () => {
    const [user, setUser] = useState(null);
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState('');
    const [accessToken, setAccessToken] = useState('')

    useEffect(() => {
        window.fbAsyncInit = () => {
            window.FB.init({
                appId:process.env.REACT_APP_API_KEY ,
                cookie: true,
                xfbml: true,
                version: 'v20.0'
            });
        };

        (function (d, s, id) {
            if (d.getElementById(id)) return;
            const js = d.createElement(s);
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            d.getElementsByTagName(s)[0].parentNode.insertBefore(js, d.getElementsByTagName(s)[0]);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    const handleFBLogin = () => {
        window.FB.login(response => {
            if (response.authResponse) {
                fetchUserData(response.authResponse.accessToken);
                fetchUserPages(response.authResponse.accessToken);
                setAccessToken(response.authResponse.accessToken)
            } else {
                console.error('User cancelled login or did not fully authorize.');
            }
        }, { scope: 'email,public_profile,pages_show_list' });
    };


    const handleLogout = async () => {
        try {
            await axios.post('https://facebook-graph-api-insights-backend.onrender.com/api/auth/logout');
            setUser(null);
            setPages([]);
            setSelectedPage('');
            setAccessToken('');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    
    const fetchUserData = async (accessToken) => {
        try {
            const { data } = await axios.post('https://facebook-graph-api-insights-backend.onrender.com/api/auth/facebook', { accessToken });
            setUser(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchUserPages = async (accessToken) => {
        try {
            const { data } = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${accessToken}`);
            setPages(data.data);
        } catch (error) {
            console.error('Error fetching user pages:', error);
        }
    };

    return (
        <div className="bg-zinc-900 text-white min-w-72 max-w-1/2 h-fit p-8 relative rounded-3xl">
            {user ? (
                <div>
                    <button onClick={handleLogout} className='bg-red-500 py-2 px-4 rounded-3xl text-sm absolute top-6 right-6'>Logout</button>
                    <div className='flex mt-3 mb-1'>
                        <img className='w-24 h-24 my-4 rounded-full ' src={user.picture} alt={user.name} />
                        <h2 className="py-10 px-6 text-xl w-full text-left leading-tight tracking-tight ">Welcome, <span className='text-blue-500 line-clamp-1 font-medium'>{user.name}</span></h2>
                    </div>
                    <Dashboard
                        user={user}
                        pages={pages}
                        selectedPage={selectedPage}
                        setSelectedPage={setSelectedPage}
                        accessToken={accessToken}
                    />
                </div>
            ) : (
                <div className='flex flex-col p-4 space-y-6'>
                    <h1 className='text-3xl w-full'>Facebook Login</h1>
                    <button className='bg-blue-600 w-full px-4 py-2 rounded-3xl my-4 hover:bg-blue-800 transition duration-200' onClick={handleFBLogin}>Login with Facebook</button>

                </div>
            )}
        </div>
    );
};


export default FacebookLogin;
