import jwt from 'jsonwebtoken';

const PRIVATE_KEY = 'clavesecreta';

export const generateAuthToken = user => {
    const token = jwt.sign(user , PRIVATE_KEY, { expiresIn: '24h'});
    return token;
};

export const auth = (req, res, next) => {
    const token = req.cookies.authToken; 

    if(!token) {
        return res.status(401).json({
            error: 'No tiene token',
            msg: 'No tiene token'
        });
    };

    try {
        req.user = jwt.verify(token, PRIVATE_KEY);
    } catch (error) {
        return res.status(403).json({
            error: 'Token invalido',
            msg: 'El token enviado no es valido o no tiene el nivel de acceso suficiente para este recurso.'
        })
    }

    next()
}

export const authorization = role => {
    return async (req, res, next) => {
        if(!req.user) res.status(401).send({error: 'Unauthorized'});
        if(req.user.role!=role) return res.status(403).send({ error: 'Sin permisos'});
        next()
    }
}