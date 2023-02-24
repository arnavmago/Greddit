import React, { useEffect } from 'react';
import '../../index.css';
import { useParams } from "react-router";
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';


export default function Stats() {
    let { name } = useParams();
    const [cookie] = useCookies();
    const navigate = useNavigate()

    useEffect(() => {
        const nocookies = () => { navigate('/') }
        if (cookie.username === undefined) {
            nocookies()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='SG-subpage'>
            <h1>Stats</h1>
        </div>
    )
}