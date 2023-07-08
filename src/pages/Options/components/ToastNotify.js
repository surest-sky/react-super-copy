import React from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ToastNotify = () => {
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            bodyClassName={'bg-red'}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
    )
}

export { ToastNotify, toast }
