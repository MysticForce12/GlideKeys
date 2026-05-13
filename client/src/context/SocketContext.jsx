import { createContext, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = ()=>{
    return useContext(SocketContext);
};

export const SocketProvider = ({children})=>{
    const socket = useMemo(()=>{
        const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const SERVER_URL = RAW_URL.replace(/\/api$/, '');
        const token = localStorage.getItem('token');
        return io(SERVER_URL,{
            withCredentials: true,
            transports: ['polling', 'websocket'],
            auth: { token }
        });
    },[]);

    return(
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};