import React, { useEffect, useState } from 'react';
import '../../index.css';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';

function List(props) {
    const [cookie] = useCookies();

    const delFollower = (name) => {
        axios.post("http://localhost:8080/delete-follower", { username: cookie.username, name: name }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false)
                }
            })
    }

    return (
        <li>
            {props.name}
            <button type='button' className='subGP-icon' onClick={() => delFollower(props.name)}><DeleteIcon /></button>
        </li>
    )
}

export default function Followers() {
    const navigate = useNavigate()
    const [cookie] = useCookies()
    const [followers, setFollowers] = useState([])

    useEffect(() => {
        const nocookies = () => { navigate('/') }
        if (cookie.username === undefined) {
            nocookies()
        }
        else {
            axios.post("http://localhost:8080/profile", { username: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
                .then((response) => {
                    setFollowers(response.data.followers)
                })
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            <div className='follow'>
                <h1 className='follow-heading'>Followers</h1>
                <ul>
                    {followers.map((follower) => <List name={follower} />)}
                </ul>
            </div>
            <div className='back-btn'>
                <button className='back-to-prof' onClick={() => navigate('/profile')}>Back To Profile</button>
            </div>
        </div>
    )
}