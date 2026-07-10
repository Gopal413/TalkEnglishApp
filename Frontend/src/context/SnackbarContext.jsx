import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

// 1. Create the context
const SnackbarContext = createContext();

// 2. Create a custom hook for easy access
export const useSnackbar = () => {
    return useContext(SnackbarContext);
};

// 3. Create the Provider component
export const SnackbarProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'

    const showSnackbar = (newMessage, newSeverity = 'info') => {
        setMessage(newMessage);
        setSeverity(newSeverity);
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const value = { showSnackbar };

    return (
        <SnackbarContext.Provider value={value}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};