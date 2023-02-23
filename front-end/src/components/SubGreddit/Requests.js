import React, { useEffect, useState } from 'react';
import '../../index.css';
import { useParams } from "react-router";
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

function Listjoined(props) {

    return (
        <li className='request'>
            <p>{props.name} <CheckCircleOutlineIcon style={{ color: "green" }} /></p>
        </li>
    )
}

function Listpending(props) {

    return (
        <li className='request'>
            <p>{props.name} <button type='button' className='subGP-icon' onClick={() => props.handleRequest(props.name, "accept")}><CheckCircleOutlineIcon /></button> <button type='button' className='subGP-icon' onClick={() => props.handleRequest(props.name, "reject")}><NotInterestedIcon style={{ color: "red" }} /></button></p>
        </li>
    )
}

export default function Requests() {
    const [cookie] = useCookies();
    const navigate = useNavigate();
    const [SG, setSG] = useState([]);
    const [reqs, setReqs] = useState([]);
    let newreqs = []
    let newusers = []
    const [users, setUsers] = useState([]);
    let { name } = useParams();

    const handleRequest = (user_name, status) => {

        newusers = users;

        for (const req in reqs) {
            if (reqs[req] !== user_name) {
                newreqs.push(reqs[req])
            }
            else {
                if (status === "accept") {
                    newusers.push(user_name);
                }
            }
        }

        setReqs(newreqs);
        setUsers(newusers);

        axios.post('http://localhost:8080/request', { username: cookie.username, reqs: newreqs, users: newusers, SG_name: name }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success")
                    window.location.reload(false);
            })

        newreqs = []
        newusers = []
    }

    useEffect(() => {
        const nocookies = () => { navigate('/') }
        if (cookie.username === undefined) {
            nocookies()
        }
        axios.post("http://localhost:8080/subgreddits", { username: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                response.data.filter((it, idx) => {
                    return it.SG_name === name
                }).map((item) => {
                    setSG(item)
                    setUsers(item.users)
                    setReqs(item.requests)
                })
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='SG-subpage'>
            <h1>Requests</h1>
            <h2>Joined</h2>
            <ul>
                {SG.users !== undefined ? SG.users.map((user) => <Listjoined name={user} handleRequest={handleRequest} />) : <p></p>}
            </ul>
            <h2>Pending</h2>
            <ul>
                {SG.requests !== undefined ? SG.requests.map((req) => <Listpending name={req} handleRequest={handleRequest} />) : <p></p>}
            </ul>
        </div>
    )
}