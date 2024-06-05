const Parent = require('../../../models/Parent');
const Child = require('../../../models/Child');
const Task = require('../../../models/Task');
//const { handleProfilePictureUpload } = require ('../../../controllers/api/v1/upload');
//const uploadController = require('./upload');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('./upload');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads'); // Directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name for the uploaded file
    }
  });
  
  const upload = multer({ storage: storage });

const generateToken = (parentId, admin) => {
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
        throw new Error('JWT_SECRET is not defined in the environment variables.');
    }

    return jwt.sign({ parentId, admin }, secretKey, { expiresIn: '1h' });
};

const signup = async (req, res) => {
    const { username, password, profilePicture } = req.body; // Extract profilePicture from request body
    // Check if username or password is empty
    if (!username || !password) {
        return res.status(400).json({ message: 'Gebruikersnaam en wachtwoord zijn verplicht.' });
    }
    try {
        const existingParent = await Parent.findOne({ username });
        if (existingParent) {
            return res.status(400).json({ message: 'Gebruiker bestaat al.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

        const parent = new Parent({ username, password: hashedPassword, profilePicture }); // Include profilePicture
        const newParent = await parent.save();

        const token = generateToken(newParent._id, newParent.admin);

        res.status(201).json({ newParent, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// const signup = async (req, res) => {
//     const { username, password, admin } = req.body;
//     // Check if username or password is empty
//     if (!username || !password) {
//         return res.status(400).json({ message: 'Gebruikersnaam en wachtwoord zijn verplicht.' });
//     }
//     try {
//         const existingParent = await Parent.findOne({ username });
//         if (existingParent) {
//             return res.status(400).json({ message: 'Gebruiker bestaat al.' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10); 

//         const parent = new Parent({ username, password: hashedPassword, admin });
//         const newParent = await parent.save();

//         const token = generateToken(newParent._id, newParent.admin);

//         res.status(201).json({ newParent, token });;
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Gebruikersnaam en Wachtwoord zijn verplicht.' });
    }
    try {
        const parent = await Parent.findOne({ username });

        if (!parent) {
            return res.status(401).json({ message: 'Gegevens komen niet overeen.' });
        }

        const passwordMatch = await bcrypt.compare(password, parent.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Gegevens komen niet overeen.' });
        }

        const token = generateToken(parent._id, parent.admin);
        const parentid = parent._id;

        res.json({ message: 'Login successful', token, parentid});;
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllParents = async (req, res) => {
    try {
        const parents = await Parent.find().populate('children');
        res.json(parents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getParentById = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.id).populate('children');
        if(parent){
            res.json(parent);
        }
        else{
            res.status(404).json({ message: 'Ouder niet gevonden.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.uploadParentProfilePicture = async (req, res) => {
    // Extract user ID from route parameters
    const userId = req.params.id; 
    if (!userId)
        return res.status(401).json({ success: false, message: 'User ID not provided!' });

    try {
        // Check if the user exists
        const existingUser = await Parent.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${userId}_profilePicture`, // Adjust public_id as needed
            width: 500,
            height: 500,
            crop: 'fill',
        });

        // Update user's profile picture URL in the database
        existingUser.profilePicture = result.secure_url;
        const updatedUser = await existingUser.save();

        // Return success response with updated user object
        res.status(201).json({ success: true, message: 'Your profile has been updated!', user: updatedUser });
    } catch (error) {
        console.error('Error while uploading parent profile image:', error);
        res.status(500).json({ success: false, message: 'Server error, please try again later', error: error.message });
    }
};

const uploadProfilePictureDuringSignup = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile_pictures', // Optional: You can organize uploaded images into folders
            width: 500,
            height: 500,
            crop: 'fill',
        });

        // Return the Cloudinary URL of the uploaded profile picture
        res.status(201).json({ success: true, message: 'Profile picture uploaded successfully', profilePictureUrl: result.secure_url });
    } catch (error) {
        console.error('Error while uploading parent profile image during signup:', error);
        res.status(500).json({ success: false, message: 'Server error, please try again later', error: error.message });
    }
};


// Add a new controller method to verify the password
const verifyPassword = async (req, res) => {
    const { parentid, password } = req.body;

    try {
        const parent = await Parent.findById(parentid);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        const passwordMatch = await bcrypt.compare(password, parent.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Password is correct, send success response
        res.status(200).json({ message: 'Password verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.verifyPassword = verifyPassword;




const createParent = async (req, res) => {
    const parent = new Parent({
        username: req.body.username,
        password: req.body.password,
        admin: req.body.admin,
        children: req.body.children,
    });
    try {
        const newParent = await parent.save();
        res.status(201).json(newParent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteParent = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.id);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        const children = await Child.find({ parents: parent._id });

        await Child.deleteMany({ parents: parent._id });

        await Task.deleteMany({ _id: { $in: children.map(child => child.tasks).flat() } });

        await Parent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Account is succesvol verwijderd.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateParentUsername = async (req, res) => {
    const { id } = req.params; // Parent ID
    const { username } = req.body; // New username

    try {
        const parent = await Parent.findById(id);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        parent.username = username;
        const updatedParent = await parent.save();

        res.json(updatedParent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getAllParents = getAllParents;
module.exports.getParentById = getParentById;
module.exports.createParent = createParent;
module.exports.deleteParent = deleteParent;
module.exports.updateParentUsername = updateParentUsername;
module.exports.signup = signup;
module.exports.login = login;
module.exports.uploadProfilePictureDuringSignup = uploadProfilePictureDuringSignup;