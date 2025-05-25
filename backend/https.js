const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

// Carga tus certificados SSL (de Let's Encrypt o tus propios)
const options = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
};

https.createServer(options, app).listen(3001, () => {
  console.log('Servidor HTTPS corriendo en puerto 3001');
});
