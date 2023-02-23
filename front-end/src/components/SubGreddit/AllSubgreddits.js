import React, { useEffect, useState } from 'react';
import '../../index.css';
import axios from 'axios';
import Fuse from 'fuse.js';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SellIcon from '@mui/icons-material/Sell';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function List(props) {
    const [cookie] = useCookies();
    const navigate = useNavigate();
    const [collapse, setCollapse] = useState(true)

    const nav_to_SG = () => {
        navigate(`/Allsubgreddits/${props.name}`)
    }

    const leftSG = () => {
        window.alert("You cant join this subgreddit, youve alreaady left it")
    }

    return (
        <li >
            <div className='subG-previews'>
                <h1>{props.name}</h1>
                {!collapse && (
                    <>
                        <p>Description: {props.description}</p>
                        <p>Banned Keywords: {props.b_keywords?.map((data, len) => (
                            len === props.b_keywords.length - 1 ? data : data + ", "
                        ))}</p>
                        <p>Number of users: {props.users.length}</p>
                        <p>Number of Posts: {props.num_posts}</p>
                    </>
                )}
                <button type='button' className='subGP-icon' onClick={() => setCollapse(!collapse)}>
                    {
                        collapse ? <ExpandMoreIcon /> : <ExpandLessIcon />
                    }
                </button>
                {
                    props.mod === cookie.username ?
                        <button type='button' className='subGP-icon' onClick={nav_to_SG}> <OpenInNewIcon /></button>
                        :
                        props.users.includes(cookie.username) ?
                            <><button type='button' className='subGP-icon' onClick={nav_to_SG}> <OpenInNewIcon /> </button> <button type='button' className='subGP-icon' onClick={() => props.leaveSG(props.name, props.mod, cookie.username)}> <NotInterestedIcon style={{ color: "red" }} /></button></>
                            :
                            props.requests.includes(cookie.username) ?
                                <button type='button' className='subGP-icon'> <HourglassEmptyIcon /> </button>
                                :
                                props.left.includes(cookie.username) ?
                                    <button type='button' className='subGP-icon' onClick={leftSG}> <CancelIcon style={{ color: "red" }} /> </button>
                                    :
                                    <button type='button' className='subGP-icon' onClick={() => props.joinSG(props.name, props.mod, cookie.username)}> <AddCircleOutlineIcon /> </button>
                }
            </div>
        </li>
    )
}

export default function AllSubgreddits() {
    const navigate = useNavigate();
    const [cookie] = useCookies();
    const [SGList, setSGList] = useState([]);
    const [SGres, setSGres] = useState([]);
    const [search, setSearch] = useState('');
    const [tag, setTag] = useState('');
    const [tags, setTags] = useState([]);
    let tagsArray = []
    const [sortType, setSortType] = useState(0);

    useEffect(() => {
        const nocookies = () => { navigate('/') }
        if (cookie.username === undefined) {
            nocookies()
        }
        axios.post("http://localhost:8080/Allsubgreddits", {}, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                setSGres(response.data)
                setSGList(response.data)
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const fuzzy = new Fuse(SGList, { includeScore: true, threshold: 0.3, keys: ['SG_name'] });

    const doSearch = (event) => {
        setSearch(event.target.value)

        let res = fuzzy.search(event.target.value);
        setSGres(res);
    }

    const sort = (event) => {
        if (event.target.innerText === "Name asc") setSortType(1)
        else if (event.target.innerText === "Name desc") setSortType(2)
        else if (event.target.innerText === "Followers") setSortType(3)
        else if (event.target.innerText === "Creation") setSortType(4)
    }

    const searchTags = () => {
        tagsArray = tag.replaceAll(" ", "").split(',')
        setTags(tagsArray);
    }

    const joinSG = (SGname, mod, user) => {
        axios.post("http://localhost:8080/JoinSG", { SGname: SGname, mod: mod, user: user }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false);
                }
            })
    }

    const leaveSG = (SGname, mod, user) => {
        axios.post("http://localhost:8080/LeaveSG", { SGname: SGname, mod: mod, user: user }, { headers: { "Authorization": `Bearer ${cookie.token}` } })
            .then((response) => {
                if (response.data.message === "success") {
                    window.location.reload(false);
                }
            })
    }

    return (
        <div className='Subgreddits'>
            <div className='SubG-page-heading'>
                <h1 className='SubG-head'>ALL <span>SUBGREDDITS</span></h1>
                <form className='search-form'>
                    <input type='text' placeholder='SEARCH' className='search-input' value={search} onChange={doSearch}></input>
                    <button type="button" className="search-button"> <SearchIcon /> </button>
                    <input type='text' placeholder='TAGS' className='search-input' value={tag} onChange={(event) => setTag(event.target.value)}></input>
                    <button type="button" className="search-button" onClick={searchTags}> <SellIcon /> </button>
                </form>
                <button type='button' className='sort-btn' onClick={sort}>Name asc</button>
                <button type='button' className='sort-btn' onClick={sort}>Name desc</button>
                <button type='button' className='sort-btn' onClick={sort}>Followers</button>
                <button type='button' className='sort-btn' onClick={sort}>Creation</button>
                <ul>
                    {SGList.filter((data) => {
                        if (search.length > 0) {
                            let isExisting = false
                            for (const result in SGres) {
                                if (SGres[result].item.SG_name === data.SG_name && SGres[result].item.Mod_username === data.Mod_username)
                                    isExisting = true
                            };
                            if (!isExisting) {
                                return false;
                            }
                        }
                        if (tag.length > 0) {
                            let tagFlag = false
                            for (const TAG in tags) {
                                console.log(tags[TAG])
                                if (data.tags.includes(tags[TAG])) {
                                    tagFlag = true
                                }
                            }
                            if (!tagFlag) {
                                return false;
                            }
                        }
                        return (data.Mod_username === cookie.username || data.users.includes(cookie.username))
                    }).sort((a, b) => {
                        switch (sortType) {
                            case 1:
                                return a.SG_name.localeCompare(b.SG_name);
                            case 2:
                                return b.SG_name.localeCompare(a.SG_name);
                            case 3:
                                return b.users?.length - a.users?.length;
                            case 4:
                                return new Date(b.createdAt) - new Date(a.createdAt);
                            default:
                                return 1;
                        }
                    }).map((SG) => <List name={SG.SG_name} description={SG.description} num_users={SG.num_users} num_posts={SG.num_posts} mod={SG.Mod_username} users={SG.users} joinSG={joinSG} leaveSG={leaveSG} requests={SG.requests} left={SG.left} b_keywords={SG.b_keywords} />)}
                    {SGList.filter((data) => {
                        if (search.length > 0) {
                            let isExisting = false
                            for (const result in SGres) {
                                if (SGres[result].item.SG_name === data.SG_name && SGres[result].item.Mod_username === data.Mod_username)
                                    isExisting = true
                            };
                            if (!isExisting) {
                                return false;
                            }
                        }
                        if (tag.length > 0) {
                            let tagFlag = false
                            for (const TAG in tags) {
                                console.log(tags[TAG])
                                if (data.tags.includes(tags[TAG])) {
                                    tagFlag = true
                                }
                            }
                            if (!tagFlag) {
                                return false;
                            }
                        }
                        return (!(data.Mod_username === cookie.username || data.users.includes(cookie.username)))
                    }).sort((a, b) => {
                        switch (sortType) {
                            case 1:
                                return a.SG_name.localeCompare(b.SG_name);
                            case 2:
                                return b.SG_name.localeCompare(a.SG_name);
                            case 3:
                                return b.users?.length - a.users?.length;
                            case 4:
                                return new Date(b.createdAt) - new Date(a.createdAt);
                            default:
                                return 1;
                        }
                    }).map((SG) => <List name={SG.SG_name} description={SG.description} num_users={SG.num_users} num_posts={SG.num_posts} mod={SG.Mod_username} users={SG.users} joinSG={joinSG} leaveSG={leaveSG} requests={SG.requests} left={SG.left} b_keywords={SG.b_keywords} />)}
                </ul>
            </div>
        </div>
    )
}