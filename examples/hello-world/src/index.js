import express from 'express';

const app = express();
const port = 3000;

app.get('/', (request, resolve) => resolve.send('Hello World!'));
app.listen(port);
