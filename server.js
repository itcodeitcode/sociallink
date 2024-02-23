
const express = require('express')
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
const privateKey = '21533SRWX5';

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { readFileSync, writeFile } = require('fs')

const port = 5000
const app = express()


app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})
app.get('/user/:id', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})
app.post('/api/login', function (req, res) {

    let row = readFileSync('./data/users.json')
    let users = JSON.parse(row)
    let username = req.body.username
    let password = req.body.password
    let data = { id: 0, username: '' }

    users.forEach(user => {
        if (user.username.toString() == username.toString() && bcrypt.compareSync(password, user.password)) {
            console.log(user.id)
            var token = jwt.sign({ user: user }, privateKey);

            data = { id: user.id, username: user.username, token }
        }
    });

    res.json(data)
})
app.post('/api/register', function (req, res) {

    let row = readFileSync('./data/users.json')
    let users = JSON.parse(row)
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    let userimage = req.body.image

    let data = { id: 0, username: '', error: '' }
    users.forEach(user => {
        if (user.username.toString() == username.toString()) {
            data.error = ' Username is already toked'
        } else {
            let id = new Date().getTime()
            var token = jwt.sign({ user: user }, privateKey);
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(password, salt);
            data = { id, username, email, password:hash, userimage, token }

        }

    });

    if (data.id > 0) {
        users.push(data)
        writeFile('./data/users.json', JSON.stringify(users), function writeJSON(err) {
            if (err) return console.log(err)
            console.log('json change...')
            console.log('json change..')
            console.log('json change.')
            console.log('')

        })
    }

    res.json(data)
})


app.get('/api/:user/links', function (req, res) {
    let userid = req.params.user

    let row = readFileSync('./data/social-links.json')
    let links = JSON.parse(row)
    let rowuser = readFileSync('./data/users.json')
    let users = JSON.parse(rowuser)
    let datalinks = []
    let datauser = {}

    users.forEach(user => {
        if (user.id == userid) {
            datauser = user
            links.forEach(link => {
                if (userid == link.user) {
                    datalinks.push(link)
                }
            })
        }


    });


    res.json({ user: datauser, links: datalinks })
})

function getUserFromHeader(req, res) {
    let token = req.headers['authorization']
    let user = { id: 0 }
    jwt.verify(token, privateKey, function (err, decoded) {
        user = decoded.user
    });
    return user
}
app.post('/api/link', function (req, res) {
    let user = getUserFromHeader(req, res)
    let data = { id: 0, user: 0, name: '', url: '' }

    if (user.id > 0) {
        let row = readFileSync('./data/social-links.json')
        let links = JSON.parse(row)
        let name = req.body.name
        let url = req.body.url
        url = 'https://' + url
        let ID = new Date().getTime()
        data = { id: ID, user: user.id, name: name, url: url }
        console.log(data)
        links.push(data)
        writeFile('./data/social-links.json', JSON.stringify(links), function writeJSON(err) {
            if (err) return console.log(err)
            console.log('json change...')
        })
    }




    res.json(data)
})


app.put('/api/link/:id', function (req, res) {
    let user = getUserFromHeader(req, res)
    let data = { id: 0, name: '', url: '' }

    if (user.id > 0) {

        let ID = req.params.id
        let row = readFileSync('./data/social-links.json')
        let links = JSON.parse(row)
        let name = req.body.name
        let url = req.body.url
        url = 'https://' + url
        links.forEach(link => {
            if (link.id == parseInt(ID)) {
                console.log(link)
                data = { id: ID, user: user.id, name: name, url: url }
            }
        });
        let newlinks = links.filter(link => { return link.id != ID })
        newlinks.push(data)

        writeFile('./data/social-links.json', JSON.stringify(newlinks), function writeJSON(err) {
            if (err) return console.log(err)
            console.log('json change...')
        })
    }
    res.json(data)
})


app.delete('/api/link/:id', function (req, res) {
    let user = getUserFromHeader(req, res)
    let ID = req.params.id
    if (user.id > 0) {

        let row = readFileSync('./data/social-links.json')
        let links = JSON.parse(row)

        let newlinks = links.filter(link => { return link.id != ID })

        writeFile('./data/social-links.json', JSON.stringify(newlinks), function writeJSON(err) {
            if (err) return console.log(err)
            console.log('json change...')
        })
    }

    res.json({ id: ID })
})

app.listen(port, () => {
    console.log('app running in http://localhost:' + port)
})