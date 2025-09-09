import React from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const handleLogin = () => {
        // Add your login logic here
        navigate('/');  //student dashboard
        navigate('/teacher'); //teacher dashboard
        navigate('/admin'); //admin dashboard
    };

    return (

    );
}

export default Login;
