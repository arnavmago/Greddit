import React from 'react';
import '../../index.css';

export default function Form(props) {
    return (
        <div className='form'>
            <div className='buttons'>
                <button className='login-btn' onClick={() => props.onFormSwitch('login')}>Login</button>
                <button className='register-btn' onClick={() => props.onFormSwitch('register')}>Register</button>
            </div>
        </div>
    )
}