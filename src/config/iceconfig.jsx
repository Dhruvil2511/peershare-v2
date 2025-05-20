const iceconfig = {
    iceServers: [
        {
            urls: [
                'stun:stun.relay.metered.ca:80', 
                'stun:stun1.l.google.com:19302', 
            ],
        },
        {
            urls: import.meta.env.VITE_ICE_TURN_SERVER_1,
            username: import.meta.env.VITE_ICE_USERNAME,
            credential: import.meta.env.VITE_ICE_PASSWORD,
        },
        // {
        //     urls: import.meta.env.VITE_ICE_TURN_SERVER_2,
        //     username: import.meta.env.VITE_ICE_USERNAME,
        //     credential: import.meta.env.VITE_ICE_PASSWORD,
        // },
        // {
        //     urls: import.meta.env.VITE_ICE_TURN_SERVER_3,
        //     username: import.meta.env.VITE_ICE_USERNAME,
        //     credential: import.meta.env.VITE_ICE_PASSWORD,
        // },
        {
            urls: import.meta.env.VITE_ICE_TURN_SERVER_4,
            username: import.meta.env.VITE_ICE_USERNAME,
            credential: import.meta.env.VITE_ICE_PASSWORD,
        },
    ],
    // To prefetch ice Candidate before setting local description range(0-255) more better but use more resource
    iceCandidatePoolSize: 4,
};
export default iceconfig;
