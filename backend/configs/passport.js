const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT  = passportJWT.ExtractJwt;
const md5 = require('md5');
const db = require('./connectDB.js').mysql_pool;
passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, 
    (username, password, cb) => {  
    db.getConnection((err, dbCon) => {
        if (err) throw error;
        dbCon.query(`SELECT * FROM member WHERE member_username = ? AND member_password = ?`, [username, md5(password)], (error, results, fields) => {
            if (error) throw error;

            if (results.length == 0) {
                return cb(null, false, {message: 'Incorrect email or password.'})
            } 
            return cb(null, results[0]["member_username"], {message: 'Logged In Successfully'})
        })
    })
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'your_jwt_secret'
},
(jwtPayload, cb) => {
 //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    
return UserModel.findOneById(jwtPayload.id)
     .then(user => {
         return cb(null, user);
     })
     .catch(err => {
         return cb(err);
     });
}
));