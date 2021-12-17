const express = require('express');
const app = express();
const cors=require('cors');
require('dotenv').config();
const ObjectId=require('mongodb').ObjectId;
const{MongoClient}=require('mongodb');
const fileUpload=require('express-fileupload');


//defualt port
const port=process.env.PORT|| 7000;
//middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload());

//connection string in mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.byzxg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
//connecting database
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){

    try{
        //making connection with database
        await client.connect();
        console.log('databse connection established');
         //creating databse and ollections
         const database=client.db('CreativeAgency');
         const servicecollection = database.collection('Services');
         const userCollection=database.collection('Users');
         const orderCollection=database.collection('Orders');
         const reviewCollection=database.collection('Reviews');


         //getting all services api calls
         app.get('/services',async (req,res) => {
             const cursor=servicecollection.find({});
             const allservices = await cursor.toArray();
             res.json(allservices);
         });
         //getting service with id
         app.get('/services/:id',async (req,res) => {
             const id=req.params.id;
             const query={_id:ObjectId(id)};
            
            const singleservice=await servicecollection.findOne(query);
            res.json(singleservice);

         })
         //adding service to database
         app.post('/addservice',async (req, res) => {
             const name=req.body.name;
             const price=req.body.price;
             const description=req.body.description;
             const pic=req.body.img;
             const picData=pic.data;
             const encodedpic=picData.toString('base64');
             const imageBuffer=Buffer.from(encodedpic,'base64');
             const service={
                 name,
                 description,
                 img:imageBuffer,
                 price
             }
             const result=await servicecollection.insertOne(service);
             res.json(result);



         });
         //user review adding to databset
         app.post('/addReview',async (req,res)=>{
            const userReview=req.body;
            const Reviewresult=await reviewCollection.insertOne(userReview);
           // console.log(carresult);
            res.json(Reviewresult);
        });
        //order service collection
        app.post('/purchaseService',async (req,res)=>{
            const orderservice=req.body;
            const orderresult=await orderCollection.insertOne(orderservice);
           // console.log(carresult);
            res.json(orderresult);
        });
        app.get('/userorders',async(req,res) => {
            const email=req.query.email;
            const query={useremail:email};
            const cursor=orderCollection.find(query);
            const userordered=await cursor.toArray();
            res.json(userordered);
        });
        //allusers oders for admin users
        app.get('/allorders',async (req, res) => {
            const cursor=orderCollection.find({});
            const orders=await cursor.toArray();
            res.send(orders);

        })

         //checking admin from database
         app.get('/users/:email',async (req,res) => {
             const email = req.params.email;
             const query={email: email}
             const user=await userCollection.findOne(query);
             let isAdmin = false;
             if(user?.role=='admin'){
                 isAdmin=true;
             }
             res.json({admin: isAdmin});
         });
         //adding user data to database
         app.post('/users',async (req, res) => {
             const user=req.body;
             const result=await userCollection.insertOne(user);
             res.json(result);
         });
         //adding already existing user data to database
         app.put('/users',async (req, res) => {
             const user=req.body;
             const filter={email: user.email};
             const options={upsert: true};
             const updateDoc={$set:user};
             const result=await userCollection.updateOne(filter,updateDoc,options);
             res.json(result);
         })
    }
    finally{
        //do something
    }
}

run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('welcome to Creative agency!');
})

app.listen(port,()=>{
    console.log(`listening at ${port}`)
})