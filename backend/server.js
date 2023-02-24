const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const { response } = require('express');
dotenv.config();

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET);
}

const app = express()

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
})
app.use(express.json())
app.use(cors())

// const mongoDB = "mongodb://127.0.0.1:27017/greddit"
const mongoDB = "mongodb+srv://arnavmago:arnav@greddit.qg68gyi.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(mongoDB)

const subGredditSchema = new mongoose.Schema({
    SG_name: String,
    description: String,
    b_keywords: [String],
    num_users: Number,
    num_posts: Number,
    Mod_username: String,
    requests: [String],
    users: [String],
    blocked: [String],
    tags: [String],
    left: [String],

}, { timestamps: true })

const commentSchema = new mongoose.Schema({
    content: String,
    postedBy: String
})

const reportSchema = new mongoose.Schema({
    reportBy: String,
    content: String,
    userReported: String,
    reason: String,
    ignored: Number
})

const postSchema = new mongoose.Schema({
    postedBy: String,
    SG_name: String,
    upvotes: Number,
    downvotes: Number,
    likedBy: [String],
    dislikedBy: [String],
    content: String,
    Report: [reportSchema],
    Comments: [commentSchema],
    banned: [String],
    saved: [String],
})

const userSchema = new mongoose.Schema({
    fName: String,
    lName: String,
    age: Number,
    email: String,
    number: String,
    username: String,
    password: String,
    followers: [String],
    following: [String],
    SG: [subGredditSchema]
})

const User = new mongoose.model("user", userSchema)
const Subgreddit = new mongoose.model("subgreddit", subGredditSchema)
const Post = new mongoose.model("post", postSchema)
const Comment = new mongoose.model("comment", commentSchema)
const Report = new mongoose.model("report", reportSchema)

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

const hashRounds = 10
app.post("/register", (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        if (user) {
            res.status(200).json({ message: "duplicate" })
        } else {
            bcrypt.hash(req.body.password, hashRounds, function (err, hash) {
                if (err) {
                    console.log(err)
                    res.send(err)
                } else {
                    req.body.password = hash
                    newUser = new User({
                        ...req.body
                    })
                    newUser.save((err) => {
                        if (err) {
                            console.log(err)
                            res.send(err)
                        } else {
                            res.status(200).json({ message: "success", token: generateAccessToken(req.body.username) })
                        }
                    })
                }
            })
        }
    })
})

app.post('/login', (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        } else if (user) {
            bcrypt.compare(req.body.password, user.password, function (err, result) {
                if (result) {
                    res.status(200).json({ message: "success", token: generateAccessToken(req.body.username) })
                } else {
                    res.status(200).json({ message: "failed" })
                }
            })
        } else {
            res.status(200).json({ message: "failed" })
        }
    })
})

app.post('/profile', authenticateToken, (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (user) {
            res.send(user)
        }
        else {
            res.status(200).json({ message: "no user" })
        }
    })
})

app.post('/profile_update', authenticateToken, (req, res) => {
    User.updateOne({ username: req.body.username }, req.body, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else {
            res.status(200).json({ message: "success" })
        }
    })
})

app.post('/subgreddits', authenticateToken, (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (user) {
            res.send(user.SG)
        }
        else {
            res.status(200).json({ message: "no user" })
        }
    })
})

app.post('/addsubgreddit', authenticateToken, (req, res) => {
    User.findOne({ username: req.body.Mod_username }, (err, user) => {
        if (user) {
            duplicate = false
            for (sg in user.SG) {
                if (user.SG[sg].SG_name === req.body.SG_name) {
                    res.status(200).json({ message: "duplicate" })
                    duplicate = true
                    break
                }
            }
            if (!duplicate) {
                newSG = new Subgreddit({
                    ...req.body,
                    ...{
                        users: [req.body.Mod_username]
                    }
                })
                user.SG.push(newSG)
                user.save()
                res.status(200).json({ message: "success" })
            }
        }
        else {
            res.status(200).json({ message: "no user" })
        }
    })
})

app.post('/delete-subgreddit', authenticateToken, (req, res) => {
    User.updateOne({ username: req.body.username }, { $pull: { SG: { SG_name: req.body.name } } }, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            // res.status(200).json({ message: "success" })
            Post.deleteMany({ SG_name: req.body.name }, (err) => {
                if (err) {
                    console.log(err)
                    res.send(err)
                }
                else
                    res.status(200).json({ message: "success" })
            })
        }
    })
})

app.post('/delete-follower', authenticateToken, (req, res) => {
    User.updateOne({ username: req.body.username }, { $pull: { followers: req.body.name } }, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            // res.status(200).json({ message: "success" })
            User.updateOne({ username: req.body.name }, { $pull: { following: req.body.username } }, (err, user) => {
                if (err) {
                    console.log(err)
                    res.send(err)
                }
                else if (user) {
                    res.status(200).json({ message: "success" })
                }
            })
        }
    })
})

app.post('/delete-following', authenticateToken, (req, res) => {
    User.updateOne({ username: req.body.username }, { $pull: { following: req.body.name } }, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            User.updateOne({ username: req.body.name }, { $pull: { followers: req.body.username } }, (err, user) => {
                if (err) {
                    console.log(err)
                    res.send(err)
                }
                else if (user) {
                    res.status(200).json({ message: "success" })
                }
            })
        }
    })
})

app.post('/request', authenticateToken, (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            for (sg in user.SG) {
                if (user.SG[sg].SG_name === req.body.SG_name) {
                    user.SG[sg].requests = req.body.reqs
                    user.SG[sg].users = req.body.users
                    user.save()
                    res.status(200).json({ message: "success" })
                }
            }
        }
    })
})

app.post('/Allsubgreddits', authenticateToken, (req, res) => {
    let allSG = []
    User.find({}, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            for (user_ in user) {
                for (sg in user[user_].SG) {
                    allSG.push(user[user_].SG[sg])
                }
            }
            res.send(allSG)
        }
    })
})

app.post('/JoinSG', authenticateToken, (req, res) => {
    User.findOne({ username: req.body.mod }, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            for (sg in user.SG) {
                if (user.SG[sg].SG_name === req.body.SGname) {
                    user.SG[sg].requests.push(req.body.user)
                    user.save()
                    res.status(200).json({ message: "success" })
                }
            }
        }
    })
})

app.post('/LeaveSG', authenticateToken, (req, res) => {
    console.log(req.body)
    User.findOne({ username: req.body.mod }, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            for (sg in user.SG) {
                if (user.SG[sg].SG_name === req.body.SGname) {
                    let index = user.SG[sg].users.indexOf(req.body.user)
                    user.SG[sg].users.splice(index, 1)
                    user.SG[sg].left.push(req.body.user)
                    user.SG[sg].num_users = user.SG[sg].users.length
                    user.save()
                    res.status(200).json({ message: "success" })
                }
            }
        }
    })
})

app.post('/getMyPosts', authenticateToken, (req, res) => {
    Post.find({ SG_name: req.body.SG_name }, (err, post) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (post) {
            User.find({}, (err, user) => {
                if (err) {
                    console.log(err)
                    res.send(err)
                }
                else if (user) {
                    for (user_ in user) {
                        for (sg in user[user_].SG) {
                            if (user[user_].SG[sg].SG_name === req.body.SG_name) {
                                user[user_].SG[sg].num_posts = post.length
                                user[user_].save()
                            }
                        }
                    }
                }
            })
            res.send(post)
        }
    })
})

app.post('/getPosts', authenticateToken, (req, res) => {
    let allpost = []
    Post.find({ SG_name: req.body.SG_name }, (err, post) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (post) {
            User.find({}, (err, user) => {
                if (err) {
                    console.log(err)
                    res.send(err)
                }
                else if (user) {
                    for (user_ in user) {
                        for (sg in user[user_].SG) {
                            if (user[user_].SG[sg].SG_name === req.body.SG_name) {
                                user[user_].SG[sg].num_posts = post.length
                                user[user_].save()
                                for (post_ in post) {
                                    if (user[user_].SG[sg].blocked.includes(post[post_].postedBy)) {
                                        let newPost = post[post_]
                                        newPost.postedBy = "Blocked User"
                                        allpost.push(newPost)
                                    }
                                    else
                                        allpost.push(post[post_])
                                }
                                res.send(allpost)
                            }
                        }
                    }
                }
            })
        }
    })
})

app.post('/post', authenticateToken, (req, res) => {
    for (bword of req.body.banned) {
        req.body.content = req.body.content.replace(/\n/g, " ")
        req.body.content = req.body.content.replace(new RegExp(bword, "gi"), '*'.repeat(bword.length))
    }

    newPost = new Post({
        ...req.body
    })

    newPost.save((err) => {
        if (err) {
            console.log(err)
            res.send(err)
        } else {
            res.status(200).json({ message: "success" })
        }
    })
})

app.post('/getBanned', authenticateToken, (req, res) => {
    let banned = []
    User.find({}, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            for (user_ in user) {
                for (sg in user[user_].SG) {
                    if (user[user_].SG[sg].SG_name === req.body.SG_name) {
                        banned = user[user_].SG[sg].b_keywords
                        res.send(banned)
                    }
                }
            }
        }
    })
})

app.post('/setComment', authenticateToken, (req, res) => {
    Post.findOne({ SG_name: req.body.SG_name, content: req.body.content, postedBy: req.body.user }, (err, post) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (post) {
            let comment = new Comment({
                content: req.body.comment,
                postedBy: req.body.user
            })

            post.Comments.push(comment)
            post.save()
            res.status(200).json({ message: "success" })
        }
    })
})

app.post('/addFollower', authenticateToken, (req, res) => {
    console.log(req.body)
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            if (req.body.username !== req.body.currUser) {
                if (!(user.followers.includes(req.body.currUser))) {
                    user.followers.push(req.body.currUser)
                    user.save()
                    User.findOne({ username: req.body.currUser }, (err, user) => {
                        if (err) {
                            console.log(err)
                            res.send(err)
                        }
                        else if (user) {
                            user.following.push(req.body.username)
                            user.save()
                            res.status(200).json({ message: "success" })
                        }
                    })
                }
                else {
                    res.status(200).json({ message: "already following" })
                }
            }
            else {
                res.status(200).json({ message: "cant follow yourself big man" })
            }
        }
    })
})

app.post('/upvote', authenticateToken, (req, res) => {
    Post.findOne({ SG_name: req.body.SG_name, content: req.body.content, postedBy: req.body.user }, (err, post) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (post) {
            if (post.likedBy.includes(req.body.currUser)) {
                res.status(200).json({ message: "already upvoted" })
            }
            else if (post.dislikedBy.includes(req.body.currUser)) {
                let index = post.dislikedBy.indexOf(req.body.currUser)
                post.dislikedBy.splice(index, 1)
                post.likedBy.push(req.body.currUser)
                post.downvotes--
                post.upvotes++
                post.save()
                res.status(200).json({ message: "success" })
            }
            else {
                post.likedBy.push(req.body.currUser)
                post.upvotes++
                post.save()
                res.status(200).json({ message: "success" })
            }
        }
    })
})

app.post('/downvote', authenticateToken, (req, res) => {
    Post.findOne({ SG_name: req.body.SG_name, content: req.body.content, postedBy: req.body.user }, (err, post) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (post) {
            if (post.dislikedBy.includes(req.body.currUser)) {
                res.status(200).json({ message: "already downvoted" })
            }
            else if (post.likedBy.includes(req.body.currUser)) {
                let index = post.likedBy.indexOf(req.body.currUser)
                post.likedBy.splice(index, 1)
                post.dislikedBy.push(req.body.currUser)
                post.downvotes++
                post.upvotes--
                post.save()
                res.status(200).json({ message: "success" })
            }
            else {
                post.dislikedBy.push(req.body.currUser)
                post.downvotes++
                post.save()
                res.status(200).json({ message: "success" })
            }
        }
    })
})

app.post('/getDesc', authenticateToken, (req, res) => {
    User.find({}, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            for (user_ in user) {
                for (sg in user[user_].SG) {
                    if (user[user_].SG[sg].SG_name === req.body.SG_name) {
                        desc = user[user_].SG[sg].description
                        res.status(200).json({ message: desc })
                    }
                }
            }
        }
    })
})

app.post('/savePost', authenticateToken, (req, res) => {
    Post.findOne({ SG_name: req.body.SG_name, content: req.body.content, postedBy: req.body.user }, (err, post) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (post) {
            if (!post.saved.includes(req.body.currUser)) {
                post.saved.push(req.body.currUser)
                post.save()
                console.log(post)
                res.status(200).json({ message: "success" })
            }
            else {
                res.status(200).json({ message: "already saved" })
            }
        }
    })
})

app.post('/unsavePost', authenticateToken, (req, res) => {
    Post.findOne({ SG_name: req.body.SG_name, content: req.body.content, postedBy: req.body.user }, (err, post) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (post) {
            let index = post.saved.indexOf(req.body.currUser)
            post.saved.splice(index, 1)
            post.save()
            res.status(200).json({ message: "success" })
        }
    })
})

app.post('/loadSavedPosts', authenticateToken, (req, res) => {
    let savedPosts = []
    Post.find({}, (err, post) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (post) {
            for (post_ of post) {
                if (post_.saved.includes(req.body.username)) {
                    savedPosts.push(post_)
                }
            }
            res.send(savedPosts)
        }
    })
})

app.post('/report', authenticateToken, (req, res) => {
    Post.findOne({ SG_name: req.body.SG_name, content: req.body.contentReported, postedBy: req.body.userReported }, (err, post) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (post) {
            let report = new Report({
                reportBy: req.body.reportBy,
                content: req.body.contentReported.replace(/\n/g, " "),
                userReported: req.body.userReported,
                reason: req.body.content.replace(/\n/g, " "),
                ignored: req.body.ignored
            })

            post.Report.push(report)
            post.save()
            res.status(200).json({ message: "success" })
        }
    })
})

app.post('/getReports', authenticateToken, (req, res) => {
    let allReports = []
    Post.find({ SG_name: req.body.SG_name }, (err, reportedPosts) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (reportedPosts) {
            for (post of reportedPosts) {
                for (report of post.Report) {
                    allReports.push(report)
                }
            }
            res.send(allReports)
        }
    })
})

app.post('/blockUser', authenticateToken, (req, res) => {
    console.log(req.body.object)
    User.find({}, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (user) {
            for (user_ in user) {
                for (sg in user[user_].SG) {
                    if (user[user_].SG[sg].SG_name === req.body.object.SG_name) {
                        if (!user[user_].SG[sg].blocked.includes(req.body.object.userReported)) {
                            let index = user[user_].SG[sg].users.indexOf(req.body.object.userReported)
                            user[user_].SG[sg].users.splice(index, 1)
                            user[user_].SG[sg].blocked.push(req.body.object.userReported)
                            user[user_].save()
                            Post.findOne({ SG_name: req.body.object.SG_name, content: req.body.object.contentReported, postedBy: req.body.object.userReported }, (err, post) => {
                                if (err) {
                                    console.log(err)
                                    res.send(err)
                                }
                                else if (post) {
                                    for (report in post.Report) {
                                        if (post.Report[report].userReported === req.body.object.userReported) {
                                            post.Report.splice(report, 1)
                                        }
                                    }
                                    post.save()
                                    res.status(200).json({ message: "success" })
                                }
                            })
                        }
                    }
                }
            }
        }
    })
})

app.post('/ignore', authenticateToken, (req, res) => {
    Post.findOne({ SG_name: req.body.object.SG_name, content: req.body.object.contentReported, postedBy: req.body.object.userReported }, (err, post) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (post) {
            for (report of post.Report) {
                if (report.content === req.body.object.contentReported && report.userReported === req.body.object.userReported && report.reason === req.body.object.content && report.reportBy === req.body.object.reportBy) {
                    report.ignored = 1
                    post.save()
                    res.status(200).json({ message: "success" })
                }
            }
        }
    })
})

app.post('/deletePost', authenticateToken, (req, res) => {
    Post.deleteOne({ SG_name: req.body.object.SG_name, content: req.body.object.contentReported, postedBy: req.body.object.userReported }, (err) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else
            res.status(200).json({ message: "success" })
    })

})

app.listen(8080, () => {
    console.log("listening on port 8080")
})