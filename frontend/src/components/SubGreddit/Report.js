import React, { useEffect, useState } from 'react';
import '../../index.css';
import { useParams } from "react-router";
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

function List(props) {
    const [cookie] = useCookies();
    let { name } = useParams();
    const duration = 5
    const [count, setCount] = useState(duration)
    const [countdown, setCountdown] = useState(false)

    let object = {
        reportBy: cookie.username,
        content: props.reason,
        userReported: props.userReported,
        SG_name: name,
        contentReported: props.content
    }

    useEffect(() => {
        let intervalID

        if (countdown) {
            intervalID = setInterval(() => {
                setCount((count) => {
                    if (count <= 0) {
                        clearInterval(intervalID)
                        setCountdown(false)
                        blockUser()
                        return duration
                    }
                    else {
                        return count - 1
                    }
                })
            }, 1000)
        }

        return () => {
            clearInterval(intervalID)
        }
    }) // eslint-disable-line react-hooks/exhaustive-deps

    const blockUser = () => {
        axios.post('http://localhost:8080/blockUser', { object }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                console.log(response.data)
                if (response.data.message === "success")
                    window.location.reload(false);
            })
    }

    const blockClicked = () => {
        if (countdown) {
            setCountdown(false)
            setCount(duration)
        }
        else {
            setCountdown(true)
        }
    }

    const ignore = () => {
        axios.post('http://localhost:8080/ignore', { object }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                console.log(response.data);
                if (response.data.message === "success")
                    window.location.reload(false);
            })
    }

    const deletePost = () => {
        axios.post('http://localhost:8080/deletePost', { object }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success")
                    window.location.reload(false);
            })
    }

    return (
        <li>
            <div className='reports'>
                <p>Report by: <span>{props.by}</span> User reported: <span>{props.userReported}</span></p>
                <p>Post content: {props.content}</p>
                <p>Reason of report: {props.reason}</p>
                {
                    !props.ignored ?
                        <div className='report-btns'>
                            {
                                countdown ?
                                    <button className='subGP-icon' onClick={blockClicked} style={{ color: "red" }}> {count} </button>
                                    :
                                    <button className='subGP-icon' onClick={blockClicked}> <BlockIcon /> </button>
                            }
                            <button className='subGP-icon' onClick={deletePost}> <DeleteIcon /> </button>
                            <button className='subGP-icon' onClick={ignore}> <HourglassDisabledIcon /> </button>
                        </div>
                        :
                        <div className='report-btns'>
                            <button className='subGP-icon' style={{ color: "grey" }}> <BlockIcon /> </button>
                            <button className='subGP-icon' style={{ color: "grey" }}> <DeleteIcon /> </button>
                            <button className='subGP-icon'> <RemoveCircleOutlineIcon style={{ color: "red" }} /> </button>
                        </div>
                }
            </div>
        </li>
    )
}

export default function Report() {
    let { name } = useParams();
    const [cookie] = useCookies();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const nocookies = () => { navigate('/') }
        if (cookie.username === undefined) {
            nocookies()
        }

        axios.post('http://localhost:8080/getReports', { SG_name: name }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                setReports(response.data)
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='SG-subpage'>
            <h1>Reports</h1>
            <ul>
                {reports?.map((report) => <List by={report.reportBy} userReported={report.userReported} content={report.content} reason={report.reason} ignored={report.ignored} />)}
            </ul>
        </div>
    )
}