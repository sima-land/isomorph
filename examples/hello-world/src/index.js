import express from 'express';
import container from './container';

const app = express();
const port = 3000;
const proxy = container.get('proxy');

proxy(app);
app.use(container.get('loggerMiddleware'));
app.use(container.get('sentryMiddleware'));

app.get('/', (request, resolve) => resolve.send('Hello, world!'));
app.listen(port);
