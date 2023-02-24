import React, { useEffect, useState } from 'react';
import '../../index.css';
import { useParams } from "react-router";
import { useCookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Listusers(props) {

    return (
        <li className='users'>
            <p>{props.name}</p>
        </li>
    )
}

function Listblocked(props) {

    return (
        <li className='blocked-users'>
            <p>{props.name}</p>
        </li>
    )
}

export default function Users() {
    const [cookie] = useCookies();
    const navigate = useNavigate()
    const [SG, setSG] = useState([])
    let { name } = useParams();

    useEffect(() => {
        const nocookies = () => { navigate('/') }
        if (cookie.username === undefined) {
            nocookies()
        }
        axios.post("http://localhost:8080/subgreddits", { username: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                response.data.filter((it, idx) => {
                    return it.SG_name === name
                }).map((item) => { setSG(item) })
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='SG-subpage'>
            <h1>Users</h1>
            <ul>
                {SG.users !== undefined ? SG.users.map((user) => <Listusers name={user} />) : <p></p>}
            </ul>
            <h1>Blocked Users</h1>
            <ul>
                {SG.blocked !== undefined ? SG.blocked.map((block) => <Listblocked name={block} />) : <p></p>}
            </ul>
        </div>
    )
}