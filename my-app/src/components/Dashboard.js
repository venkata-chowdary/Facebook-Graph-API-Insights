import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = ({ user, pages, selectedPage, setSelectedPage, accessToken }) => {
    const [followersCount, setFollowersCount] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [impressions, setImpressions] = useState(null);
    const [reactions, setReactions] = useState(null);
    
    const [errorMessages, setErrorMessages] = useState({
        engagement: null,
        impressions: null,
        reactions: null,
    });
    const [since, setSince] = useState('');
    const [until, setUntil] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedPage) {
            fetchPageFollowers(selectedPage);
        }
    }, [selectedPage]);

    const fetchPageFollowers = async (pageId) => {
        try {
            const response = await axios.get(
                `https://graph.facebook.com/${pageId}?fields=followers_count&access_token=${accessToken}`
            );
            const totalFollowers = response.data.followers_count;
            setFollowersCount(totalFollowers);
        } catch (error) {
            console.error('Error fetching followers:', error);
        }
    };

    const fetchEngagement = async (pageId, sinceDate, untilDate) => {
        try {
            let url = `https://graph.facebook.com/${pageId}/insights?metric=page_engagement&period=day&access_token=${accessToken}`;
            if (sinceDate && untilDate) {
                url += `&since=${sinceDate}&until=${untilDate}`;
            } else {
                url += `&period=total_over_range`;
            }

            const response = await axios.get(url);
            const engagementData = response.data.data[0]?.values[0]?.value || 0;
            setEngagement(engagementData);
            setErrorMessages((prev) => ({ ...prev, engagement: null }));
        } catch (err) {
            handleError(err, 'engagement');
        }
    };

    const fetchImpressions = async (pageId, sinceDate, untilDate) => {
        try {
            let url = `https://graph.facebook.com/${pageId}/insights?metric=page_impressions&period=day&access_token=${accessToken}`;
            if (sinceDate && untilDate) {
                url += `&since=${sinceDate}&until=${untilDate}`;
            } else {
                url += `&period=total_over_range`; 
            }

            const response = await axios.get(url);
            console.log('Impressions:', response.data);
            const impressionsData = response.data.data[0]?.values[0]?.value || 0;
            setImpressions(impressionsData);
            setErrorMessages((prev) => ({ ...prev, impressions: null }));
        } catch (err) {
            handleError(err, 'impressions');
        }
    };

    const fetchReactions = async (pageId, sinceDate, untilDate) => {
        try {
            let url = `https://graph.facebook.com/${pageId}/insights?metric=page_reactions&period=day&access_token=${accessToken}`;
            if (sinceDate && untilDate) {
                url += `&since=${sinceDate}&until=${untilDate}`;
            } else {
                url += `&period=total_over_range`;
            }

            const response = await axios.get(url);
            const reactionsData = response.data.data[0]?.values[0]?.value || 0;
            setReactions(reactionsData);
            setErrorMessages((prev) => ({ ...prev, reactions: null }));
        } catch (err) {
            handleError(err, 'reactions');
        }
    };



    const handleError = (err, metric) => {
        if (err.response && err.response.data.error) {
            const errorCode = err.response.data.error.code;
            if (errorCode === 100) {
                setErrorMessages((prev) => ({
                    ...prev,
                    [metric]: `Insufficient data for ${metric}.`,
                }));
                if (metric === 'engagement') setEngagement(null);
                if (metric === 'impressions') setImpressions(null);
                if (metric === 'reactions') setReactions(null);
            } else {
                setErrorMessages((prev) => ({
                    ...prev,
                    [metric]: `Error fetching ${metric} data.`,
                }));
            }
        } else {
            console.error('Unknown error:', err);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        await fetchEngagement(selectedPage, since, until);
        await fetchImpressions(selectedPage, since, until);
        await fetchReactions(selectedPage, since, until);
        setLoading(false);
    };

    return (
        <div className="bg-gray-900 text-gray-300 py-5 px-4 rounded-3xl shadow-md">
            {followersCount !== null && (
                <div className="flex flex-col mb-5">
                    <div className="bg-gray-800 text-sm p-2 px-4 rounded-3xl shadow">
                        Total Followers: <span className="font-bold">{followersCount}</span>
                    </div>
                </div>
            )}
            <div className='px-2 mb-4'>
                <h2 className="text-ld font-medium mb-2 px-1 ">Your Pages</h2>
                <select
                    onChange={(e) => setSelectedPage(e.target.value)}
                    value={selectedPage}
                    className=" text-sm bg-gray-700 text-gray-300 border border-gray-600 rounded-3xl p-2 transition duration-200 focus:ring focus:ring-blue-400 focus:outline-none cursor-pointer"
                >
                    <option value="">Select a Page</option>
                    {pages.map((page) => (
                        <option key={page.id} value={page.id}>{page.name}</option>
                    ))}
                </select>
            </div>


            <div className="flex space-x-4 mb-5 px-2">
                <label className="flex flex-col text-gray-300 text-sm">
                    <span className='m-1 mx-1.5'>Since:</span>
                    <input
                        type="date"
                        value={since}
                        onChange={(e) => setSince(e.target.value)}
                        className="bg-gray-700 text-gray-300 border border-gray-600 rounded-3xl p-2 px-3 focus:ring focus:ring-blue-400 focus:outline-none"
                    />
                </label>
                <label className="flex flex-col text-gray-300 text-sm">
                <span className='m-1 mx-1.5'>Until:</span>
                <input
                        type="date"
                        value={until}
                        onChange={(e) => setUntil(e.target.value)}
                        className="bg-gray-700 text-gray-300 border border-gray-600 rounded-3xl p-2 px-3 focus:ring focus:ring-blue-400 focus:outline-none"
                    />
                </label>
            </div>

            <button
                onClick={handleSubmit}
                className="mx-2 bg-blue-600 text-gray-100 py-1.5 px-4 rounded-3xl text-sm hover:bg-blue-800 transition duration-200">
                Submit
            </button>

            {loading ? (
                <div className="text-lg mt-4 text-gray-400">Loading metrics data...</div>
            ) : (
                <div className='px-3 mt-4 flex flex-col space-y-4'>
                    {engagement !== null ? (
                        <div className="bg-gray-800 text-sm font-medium p-3 rounded-md shadow mt-2">
                            Total Engagement: <span className="font-semibold">{engagement}</span>
                        </div>
                    ) : (
                        errorMessages.engagement && (
                            <div className="text-red-400 mt-1 text-sm">{errorMessages.engagement}</div>
                        )
                    )}

                    {impressions !== null ? (
                        <div className="bg-gray-800 text-sm font-medium p-3 rounded-md shadow mt-2">
                            Total Impressions: <span className="font-semibold">{impressions}</span>
                        </div>
                    ) : (
                        errorMessages.impressions && (
                            <div className="text-red-400 mt-1 text-sm">{errorMessages.impressions}</div>
                        )
                    )}

                    {reactions !== null ? (
                        <div className="bg-gray-800 text-sm font-medium p-3 rounded-md shadow mt-2">
                            Total Reactions: <span className="font-semibold">{reactions}</span>
                        </div>
                    ) : (
                        errorMessages.reactions && (
                            <div className="text-red-400 mt-1 text-sm">{errorMessages.reactions}</div>
                        )
                    )}
                </div>
            )}
        </div>
    );


};

export default Dashboard;
