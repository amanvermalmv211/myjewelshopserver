import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const fetchadmin = (req, res, next)=>{
    const token = req.header('auth-token'); // 'auth-token' is the name of the header to be use.
    if(!token){
        res.status(401).send({error: "Please authenticate using a valid token"});
    }
    
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.admin = data.admin;
        next();
    } catch (error) {
        res.status(401).send({error: "Please authenticate using a valid token"});
    }

}

export default fetchadmin;