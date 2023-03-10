import React, { useEffect, useState } from 'react';
import '../../index.css';
import { Form, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

export default function Login() {
    const navigate = useNavigate()
    const [cookies] = useCookies()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [canSubmit, setSubmit] = useState(0)

    useEffect(() => {
        if (cookies.username !== undefined) {
            navigate('/profile')
        }
        else {
            if ({ username }.username !== '') {
                if ({ password }.password !== '') {
                    setSubmit(1)
                }
                else {
                    setSubmit(0)
                }
            }
            else {
                setSubmit(0)
            }
            return () => { }
        }
    })

    return (
        <div className='form'>
            <div className='Login'>
                <Form method='post' action='/profile'>
                    <input type='text' name='username' placeholder='USERNAME' value={username} onChange={(event) => setUsername(event.target.value)}></input><br />
                    <input type='password' name='password' placeholder='PASSWORD' value={password} onChange={(event) => setPassword(event.target.value)}></input><br /><br />
                    {
                        canSubmit ? <button type='submit' className='submit-btn'>SUBMIT</button> : <button type='button' className='submit-alt'>Please enter a username and password</button>
                    }
                </Form>
            </div>
        </div >
    )
}