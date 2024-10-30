import express from 'express';
import session from 'express-session';
import router from './routes/routes.mjs';  

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
secret: 'seu-segredo',
resave: false,
saveUninitialized: true,
}));

app.use(router);


export default app;
