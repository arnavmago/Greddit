import React, { useEffect, useState } from 'react';
import '../../index.css';
import Avatar from '../Images/Darth-Vader-Avatar.png';
import { Form, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

export default function Profile() {
    const navigate = useNavigate();
    const [firstName, setFName] = useState('')
    const [lastName, setLName] = useState('')
    const [age, setAge] = useState('')
    const [email, setEmail] = useState('')
    const [number, setNumber] = useState('')
    const [username, setUsername] = useState('')
    const [cookie, setCookie, removeCookie] = useCookies()
    const [numFollowing, setNumFollowing] = useState(0)
    const [numFollowers, setNumFollowers] = useState(0)

    useEffect(() => {
        if (cookie.username === undefined) {
            nocookies()
        }
        axios.post("http://localhost:8080/profile", { username: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                setFName(response.data.fName)
                setLName(response.data.lName)
                setAge(response.data.age)
                setEmail(response.data.email)
                setNumber(response.data.number)
                setUsername(response.data.username)
                setNumFollowers(response.data.followers?.length)
                setNumFollowing(response.data.following?.length)
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const nocookies = () => { navigate('/') }

    const delCookies = () => {
        removeCookie('username')
        removeCookie('token')
        nocookies()
        window.location.reload(false)
    }

    return (
        <div className='profile'>
            <div className='profile-page-heading'>
                <h1 className='profile-head'>YOUR <span>PROFILE</span></h1>
            </div>
            <div className='profile-content'>
                <img className='Avatar' src={Avatar} alt={"Darth Vader"}></img>
                <h1 className='user-name'>{username}</h1>
            </div>
            <div className='profile-content'>
                <Form className='profile-form' method='post' action='/profile'>
                    <input type='text' name='fName' value={firstName} onChange={(event) => setFName(event.target.value)}></input>
                    <input type='text' name='lName' value={lastName} onChange={(event) => setLName(event.target.value)}></input><br />
                    <input type='number' name='age' value={age} onChange={(event) => setAge(event.target.value)}></input>
                    <input type='text' name='email' value={email} onChange={(event) => setEmail(event.target.value)}></input><br />
                    <input type='tel' name='number' value={number} onChange={(event) => setNumber(event.target.value)}></input>
                    <input type='text' name='username' value={username}></input><br />
                    <button className='follow-btn' onClick={() => navigate('/profile/followers')}>FOLLOWERS <span>{numFollowers}</span></button>
                    <button className='follow-btn' onClick={() => navigate('/profile/following')}>FOLLOWING <span>{numFollowing}</span></button><br /><br />
                    <button type='submit' className='logout-btn'>Save Changes</button><br /><br />
                    <button className='logout-btn' onClick={delCookies}><LogoutIcon /></button>
                </Form>
            </div>
        </div>
    )
}