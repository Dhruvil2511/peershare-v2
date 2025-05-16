import React from "react";
import peer_cry from "../assets/peer_crying.webp";

const NoPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <img
                src={peer_cry}
                alt="Peer crying"
                priority
            />
            <h1 className="text-6xl md:text-7xl font-bold mb-6">404</h1>
            <p className="text-2xl  mb-4">Oops! Page not found</p>
            <p className="text-md  mb-6 max-w-md">
                The page you're looking for doesn't exist or has been moved. But don't worry, Peer is here with you 🥲
            </p>
        </div>
    );
};

export default NoPage;
