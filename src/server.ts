import https from 'https';
import fs from 'fs';
import { app } from './app';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


const PORT = process.env.PORT || 3000;

// const options = {
//   key: fs.readFileSync('./server.key'), // Replace with your private key path
//   cert: fs.readFileSync('./server.cert'), // Replace with your certificate path
// };

// const server = https.createServer(options, app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});