import { createContext, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = ()=>{
    return useContext(SocketContext);
};

export const SocketProvider = ({children})=>{
    const socket = useMemo(()=>{
        const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
        return io(SERVER_URL,{
            withCredentials: true
        });
    },[]);

    return(
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};