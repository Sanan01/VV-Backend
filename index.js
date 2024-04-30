const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');
const express = require('express');
const connectDatabase = require('./config/database');

const swaggerJSDOC = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const adminRoutes = require('./Routes/adminRoutes');
const userRoutes = require('./Routes/userRoutes');
const partyRoutes = require('./Routes/partyRoutes');
const citizenRoutes = require('./Routes/citizenRoutes');
const candidateRoutes = require('./Routes/candidateRoutes');
const electionRoutes = require('./Routes/electionRoutes');
const votesRoutes = require('./Routes/votesRoutes');

const {notFound,errorHandler} = require('./Middleware/errorMiddleware')

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();
connectDatabase();

const port = 5000;

// const options = {
//     definition: {
//         openapi : '3.0.0',
//         info : {
//             title : 'Visionary Voting API\'s',
//             version: '1.0.0'
//         },
//         servers : [
//             {
//                 url : 'http://localhost:5000/'
//             }
//         ]
       
//     } ,
//     apis : ['./index.js']
// }

// const swaggerSpec = swaggerJSDOC(options);
// app.use('/visionary-voting' , swaggerUI.serve , swaggerUI.setup(swaggerSpec))


app.get('/',(req,res)=>{
    res.send("API is running!");
});

app.use('/api/admin',adminRoutes);
app.use('/api/user',userRoutes);
app.use('/api/party',partyRoutes);
app.use('/api/citizen',citizenRoutes);
app.use('/api/candidate',candidateRoutes);
app.use('/api/election',electionRoutes);
app.use('/api/votes',votesRoutes);


// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(port,console.log(`Server started on port ${port}!`.yellow.bold));