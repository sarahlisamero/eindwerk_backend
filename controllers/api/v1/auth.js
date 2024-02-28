const Parent = require('../../../models/Parent');
const jwt = require('jsonwebtoken'); 
// const passport = require('../../../passport/passport');

const signup = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    const parent = new Parent({ 
        username: username 
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

// const login = async (req, res, next) => {
//     const parent = await Parent.authenticate()(req.body.username, req.body.password).then(result => {
       
//         if (!result.parent) {
//             return res.json({
//                 "status": "failed",
//                 "message": "Login failed"
//             })
//         }

//         let token = jwt.sign({
//             uid: result.user._id,
//             username: result.user.username
//         }, process.env.JWT_SECRET);

//         return res.json({
//             "status": "success",
//             "data": {
//                 "token": token
//             }
//         });
//     }).catch(error => {
//         res.json({
//             "status": "error",
//             "message": error
//         })
//     });
// };


const login = async (req, res, next) => {
    const parent = await Parent.authenticate()(req.body.username, req.body.password).then(result => {
    
    res.json({
        "status": "You are logged in",
        "data": {
            "parent": result
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
module.exports.login = login;