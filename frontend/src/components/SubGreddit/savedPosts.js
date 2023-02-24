import React, { useEffect, useState } from 'react';
import '../../index.css';
import { useCookies } from 'react-cookie';
import { useNavigate, Form, redirect } from 'react-router-dom';

import Cookies from 'js-cookie';
import axios from 'axios';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SendIcon from '@mui/icons-material/Send';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ReportIcon from '@mui/icons-material/Report';
let sg_name = ''

function CommentItem(props) {
    return (
        <li className='comment'>
            {props.comment} - {props.by}
        </li>
    )
}

function List(props) {
    const [cookie] = useCookies();
    const [comments, setComments] = useState('')
    const [modal, showModal] = useState(false)

    const comment = () => {
        if (comments.length > 0) {
            axios.post('http://localhost:8080/setComment', { SG_name: props.SG_name, comment: comments, user: props.by, content: props.content }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
                .then((response) => {
                    if (response.data.message === "success") {
                        window.location.reload(false);
                    }
                })
        }
    }

    const follow = () => {
        axios.post('http://localhost:8080/addFollower', { username: props.by, currUser: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false);
                }
                else {
                    window.alert(response.data.message);
                }
            })
    }

    const upvote = () => {
        axios.post('http://localhost:8080/upvote', { SG_name: props.SG_name, user: props.by, content: props.content, currUser: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false);
                }
                else {
                    window.alert(response.data.message);
                }
            })
    }

    const downvote = () => {
        axios.post('http://localhost:8080/downvote', { SG_name: props.SG_name, user: props.by, content: props.content, currUser: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false);
                }
                else {
                    window.alert(response.data.message);
                }
            })
    }

    const unsavePost = () => {
        axios.post('http://localhost:8080/unsavePost', { SG_name: props.SG_name, user: props.by, content: props.content, currUser: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false);
                }
            })
    }

    const reportPost = () => {
        showModal(!modal)
        sg_name = props.SG_name
    }

    return (
        <li >
            <div className='post'>
                <h1>{props.SG_name}</h1>
                <h1>By: {props.by} <button className='subGP-icon' onClick={follow}><AddCircleOutlineIcon /></button> </h1>
                <p>{props.content}</p>
                <div className='vote-btns'>
                    <button className='subGP-icon' onClick={upvote}><ArrowUpwardIcon /> {props.upvotes}</button> <button className='subGP-icon' onClick={downvote}><ArrowDownwardIcon /> {props.downvotes}</button>
                </div>
                <button className='subGP-icon' onClick={reportPost}><ReportIcon /></button>
                <button className='subGP-icon' onClick={unsavePost}><BookmarkIcon /> </button>
                <input type='text' placeholder='Comment' className='comment-box' onChange={(event) => setComments(event.target.value)}></input>
                <button type='button' className='subGP-icon' onClick={comment}> <SendIcon /> </button>
                <ul className='comments'>
                    {props.allComments?.map((comment) => <CommentItem comment={comment.content} by={comment.postedBy} />)}
                </ul>
            </div>
            {
                modal && (
                    <>
                        <Form method='post' action={`/savedPosts`}>
                            <p>Why are you reporting the post?</p>
                            <textarea name='reportReason'></textarea> <br />
                            <label htmlFor='nameOfUser'>User reported:</label>
                            <input name='userReported' id='nameOfUser' value={props.by}></input> <br />
                            <label htmlFor='postContent'>Content of post reported:</label>
                            <input name='postContent' id='postContent' value={props.content}></input> <br />
                            <button type='submit' className='post-btn'> <SendIcon /> </button>
                        </Form>
                    </>
                )
            }
        </li>
    )
}

export default function SavedPosts() {
    const [cookie] = useCookies();
    const navigate = useNavigate();
    const [allPosts, setAllPosts] = useState([]);

    useEffect(() => {
        const nocookies = () => { navigate('/') }
        if (cookie.username === undefined) {
            nocookies()
        }

        axios.post('http://localhost:8080/loadSavedPosts', { username: cookie.username }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                setAllPosts(response.data)
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='savedPostsPage'>
            <h1 className='savedPostsPage-head'>YOUR <span>SAVED POSTS</span></h1>
            <ul>
                {allPosts.map((post) => <List by={post.postedBy} upvotes={post.upvotes} downvotes={post.downvotes} content={post.content} SG_name={post.SG_name} allComments={post.Comments} />)}
            </ul>
        </div>
    )
}

export const savedReportSubmit = async ({ request }) => {
    const TokenCookie = Cookies.get('token');
    const UserCookie = Cookies.get('username');
    const data = Object.fromEntries(await request.formData())

    const newData = {
        reportBy: UserCookie,
        content: data.reportReason,
        userReported: data.userReported,
        SG_name: sg_name,
        contentReported: data.postContent,
        ignored: 0
    }

    const response = await axios.post('http://localhost:8080/report', newData, { headers: { "Authorization": `Bearer ${TokenCookie}` } })
    if (response.data.message !== "success")
        window.alert("Failed")

    window.location.reload(false)
    return redirect(`/savedPosts`)
}