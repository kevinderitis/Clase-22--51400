import express from 'express';
import cookieParser from 'cookie-parser';
import { generateAuthToken, auth, authorization } from './src/utils/jwt.js';
import passport from 'passport'; // para passport
import { initializePassport, passportCall } from './src/utils/passport.js';

const usuarios = [];

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

// Para passport
initializePassport();
app.use(passport.initialize())


app.post('/register', (req, res) => {
    const userBody = req.body;
    const usuario = usuarios.find(usuario => usuario.email == userBody.email);
    if(usuario){
        return res.status(400).json({ error: 'Usuario ya existente'})
    };

    usuarios.push(userBody);
    const access_token = generateAuthToken({email: userBody.email, password: userBody.password, role: 'user'})
    res.cookie('authToken', access_token, { httpOnly: true}).json({msg: 'Usuario registrado exitosamente'})
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const usuario = usuarios.find(usuario => usuario.email == email);
    if(!usuario) {
        return res.json({ error: 'Usuario no registrado'})
    };
    if(usuario.password !== password){
        return res.json({ error: 'Credenciales invalidas'})
    }

    const access_token = generateAuthToken({ email, password, role: 'user'})
    res.cookie('authToken', access_token, { httpOnly: true}).json({msg: 'Usuario logueado exitosamente'})
})

app.get('/datos', auth, (req, res) => {
    res.json({ msg: 'Vista protegida por middleware de autenticacion'})
})


// Ruta solo para passport
app.get('/current', passport.authenticate('jwt', { session: false}), (req, res) => {
    res.send('Llegamos mediante passport')
})

app.get('/current2', passportCall('jwt'), authorization('user'),(req, res) => {
    res.send(req.user)
})


const server = app.listen(8080, () => console.log('server running'))