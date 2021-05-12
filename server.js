const { MongoClient } = require("mongodb")
const Express = require("express")
const path = require("path")
const config = require("./config.json")
const cors = require('cors');

const uri = config["db_uri"]
const port = config["listen_port"]

async function getData(collection) {
    let result = await collection.find()

    return await result.toArray()
}

async function connectDB() {
    const client = new MongoClient(uri, { useUnifiedTopology: true })
    try{
        // connect the database
        await client.connect()
        const projects = client.db("main").collection("projects")

        console.log("[+] DB connected")

        // initialize Express
        const app = Express()

        app.use(cors({
            origin: '*'
        }));

        app.use(Express.static(path.join(__dirname, 'build')));

        app.get('/', function (req, res) {
            res.sendFile(path.join(__dirname, 'build', 'index.html'));
        });


        app.get('/projects', function(req, res){
            getData(projects).then(data => {
                res.send(JSON.stringify(data))
            })
        });

        // start the server
        app.listen(port, () => {
            console.log(`[+] listening on port ${port}`)
        })


    } catch (e) {
        console.log(e)
    }
}

connectDB()






