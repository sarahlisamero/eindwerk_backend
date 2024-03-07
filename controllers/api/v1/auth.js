/*const Parent = require('../../../models/Parent');
const jwt = require('jsonwebtoken'); 
//const config = require('config');
const { use } = require('passport');

const signup = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let admin = req.body.admin;
    let children = req.body.children;

    const parent = new Parent({ 
        username: username, admin: admin, children: children 
    });

    await parent.setPassword(password);
    await parent.save().then (result => {

        let token = jwt.sign({
            uid: result._id,
            username: result.username
        }, process.env.JWT_SECRET);

        res.json({
          status: "success",
          data: {
            token: token,
          },
        });
    }).catch(err => {
        res.json({
            "status": err
        });
    });
};

const login = async (req, res, next) => {
    const user = await Parent.authenticate()(req.body.username, req.body.password).then(result => {
       
        if (!result.user) {
            return res.json({
                "status": "failed",
                "message": "Login failed"
            })
        }

        let token = jwt.sign({
            uid: result.user._id,
            username: result.user.username
        }, process.env.JWT_SECRET);

        return res.json({
            "status": "success",
            "data": {
                "token": token
            }
        });
    }).catch(error => {
        res.json({
            "status": "error",
            "message": error
        })
    });
};

module.exports.signup = signup;
module.exports.login = login;*/