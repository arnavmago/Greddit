import React, { useEffect, useState } from 'react';
import '../../index.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

function List(props) {
    const [collapse, setCollapse] = useState(true)
    const [cookie] = useCookies();
    const navigate = useNavigate()

    const deleteSubG = (name) => {
        axios.post("http://localhost:8080/delete-subgreddit", { username: cookie.username, name: name }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false)
                }
            })
    }

    const nav_to_SG = () => {
        navigate(`/subgreddits/${props.name}`)
    }

    return (
        <li >
            <div className='subG-previews'>
                <h1>{props.name}</h1>
                {!collapse && (
                    <>
                        <p>Description: {props.description}</p>
                        <p>Banned Keywords: {props.b_keywords?.map((data, len) => (
                            len === props.b_keywords?.length - 1 ? data : data + ", "
                        ))}</p>
                        <p>Number of users: {props.users?.length}</p>
                        <p>Number of Posts: {props.num_posts}</p>
                    </>
                )}
                <button type='button' className='subGP-icon' onClick={() => setCollapse(!collapse)}>
                    {
                        collapse ? <ExpandMoreIcon /> : <ExpandLessIcon />
                    }
                </button>
                <button type='button' className='subGP-icon' onClick={nav_to_SG}><OpenInNewIcon /></button>
                <button type='button' className='subGP-icon' onClick={() => deleteSubG(props.name)}><DeleteIcon /></button>
            </div>
        </li>
    )
}

export default function Subgreddits() {
    const navigate = useNavigate();
    const [cookie] = useCookies();
    const [SGList, setSGList] = useState([])

    useEffect(() => {
        const nocookies = () => { navigate('/') }
        if (cookie.username === undefined) {
            nocookies()
        }
        axios.post("http://localhost:8080/subgreddits", { username: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                setSGList(response.data)
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='Subgreddits'>
            <div className='SubG-page-heading'>
                <h1 className='SubG-head'>YOUR <span>SUBGREDDITS</span></h1>
                <button className='add-SubG-btn' onClick={() => navigate('/subgreddits/addsubgreddit')}>Add a SubGreddit</button>
                <ul>
                    {SGList.map((SGList) => <List name={SGList.SG_name} description={SGList.description} tags={SGList.tags} users={SGList.users} num_posts={SGList.num_posts} b_keywords={SGList.b_keywords} />)}
                </ul>
            </div>
        </div>
    )
}