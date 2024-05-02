const Child = require('../../../models/Child');
const Parent = require('../../../models/Parent');
const Task = require('../../../models/Task');
//const uploadController = require('./upload');
const cloudinary = require('./upload');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploadsChild'); // Directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name for the uploaded file
    }
  });
  
  const upload = multer({ storage: storage });

const getAllChildren = async (req, res) => {
    try {
        const children = await Child.find().populate('parents');
        res.json(children);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getChildById = async (req, res) => {
    try {
        const child = await Child.findById(req.params.id).populate('parents');
        if(child){
            res.json(child);
        }
        else{
            res.status(404).json({ message: 'Kind account is niet gevonden.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// exports.uploadChildProfilePicture = async (req, res) => {
//     await uploadController.handleFileUpload(Child, req, res);
// };

exports.uploadChildProfilePicture = async (req, res) => {
    const userId = req.params.id; // Extract user ID from route parameters
    if (!userId)
        return res.status(401).json({ success: false, message: 'User ID not provided!' });

    try {
        // Check if the user exists
        const existingUser = await Child.findById(userId);
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

exports.uploadChildDocument = async (req, res) => {
    const childId = req.params.id; // Extract child ID from route parameters
    if (!childId) {
        return res.status(401).json({ success: false, message: 'Child ID not provided!' });
    }

    try {
        // Check if the child exists
        const existingChild = await Child.findById(childId);
        if (!existingChild) {
            return res.status(404).json({ success: false, message: 'Child not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        existingChild.document.push({
            url: result.secure_url,
            public_id: result.public_id
        });
        

        // Save the updated child object
        const updatedChild = await existingChild.save();

        // Return success response with updated child object
        res.status(201).json({ success: true, message: 'Document uploaded successfully!', child: updatedChild });
    } catch (error) {
        console.error('Error while uploading child document:', error);
        res.status(500).json({ success: false, message: 'Server error, please try again later', error: error.message });
    }
};

// Controller method to get documents for a specific child
exports.getChildDocuments = async (req, res) => {
    try {
        const childId = req.params.id;
        const child = await Child.findById(childId);
        if (!child) {
            return res.status(404).json({ error: 'Child not found' });
        }
        const documents = child.document;
        res.json(documents);
    } catch (error) {
        console.error('Error fetching child documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// exports.uploadChildDocument = async (req, res) => {
//     await uploadController.handleFileUpload(Child, req, res);
// };


// // Controller method to get documents for a specific child
// exports.getChildDocuments = async (req, res) => {
//     try {
//         const childId = req.params.id;
//         const child = await Child.findById(childId);
//         if (!child) {
//             return res.status(404).json({ error: 'Child not found' });
//         }
//         const documents = child.document;
//         res.json(documents);
//     } catch (error) {
//         console.error('Error fetching child documents:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };




// Create a new child
const createChild = async (req, res) => {
    if (req.user.admin) {
        const { name, parents: parentIds, profilePicture } = req.body; // Include profilePicture in the request body
        if (!name) {
            return res.status(400).json({ message: 'Gebruikersnaam is verplicht.' });
        }
        try {
            // Check if the child already exists
            const existingChild = await Child.findOne({ name: name });
            if (existingChild) {
                return res.status(400).json({ message: 'Gebruikersnaam van kind bestaat al.' });
            }
            // Generate a unique code for the child
            const code = await generateCode();
            // Find parents 
            const parents = await Parent.find({ _id: { $in: parentIds } });
            // Create child object
            const child = new Child({
                name,
                code,
                parents: parents.map(parent => parent._id),
                profilePicture: profilePicture // Store the Cloudinary URL in the database
            });
            // Save child
            const newChild = await child.save();
            // Update parents with new child
            parents.forEach(async parent => {
                parent.children.push(newChild._id);
                await parent.save();
            });
            res.status(201).json(newChild);
        } catch(error) {
            res.status(400).json({ message: error.message });
        }
    } else {
        res.status(403).json({ message: 'Je hebt niet de juiste rechten voor deze actie.' });
    }
};


// generateCode function
function generateCode(){
    const randomString = Math.random().toString(36).substring(2, 8);
    return Child.exists({ code: randomString }).then(exists => {
        if(exists){
            return generateCode();
        }
        return randomString;
    });
}

const checkChildCredentials = async (req, res) => {
    const { name, code} = req.body;
    console.log('Received credentials:', name, code);
    const parentId = req.params.parentId;
    if (!name || !code) {
        return res.status(400).json({ message: 'Naam en code zijn verplicht.' });
    }
    try{
     //find child and check credentials
        const child = await Child.findOne({ name: name, code: code }).populate('parents');
        if (!child) {
            return res.status(404).json({ message: 'Onjuiste gegevens.' });
        } 
        //find parent
        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Ouder is niet gevonden.' });
        }
        // Check if child is already linked to the parent
        if (parent.children.includes(child._id)) {
            return res.status(400).json({ message: 'Kind en ouder zijn al gelinkt.' });
        }
        //link parent and child
        parent.children.push(child._id);
        await parent.save();
        child.parents.push(parent._id);
        await child.save();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteChild = async (req, res) => {
    try {
        const childId = req.params.id;
        const child = await Child.findById(childId);
        if(!child){
            return res.status(404).json({ message: 'Kind account is niet gevonden.' });
        }
        await Parent.updateMany(
            { _id: { $in: child.parents } }, 
            { $pull: { children: childId } 
        });
        await Child.findByIdAndDelete(childId);
        res.json({ message: 'Kind account is succesvol verwijderd.' });
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
};

const updateChildUsername = async (req, res) => {
    const { id } = req.params; // Child ID
    const { name } = req.body; // New username

    try {
        const child = await Child.findById(id);
        if (!child) {
            return res.status(404).json({ message: 'Kind account is niet gevonden.' });
        }

        child.name = name;
        const updatedChild = await child.save();

        res.json(updatedChild);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getAllChildren = getAllChildren;
module.exports.getChildById = getChildById;
module.exports.createChild = createChild;
module.exports.deleteChild = deleteChild;
module.exports.updateChildUsername = updateChildUsername;
module.exports.checkChildCredentials = checkChildCredentials;


















// const Child = require('../../../models/Child');
// const Parent = require('../../../models/Parent');
// const Task = require('../../../models/Task');
// //const uploadController = require('./upload');

// const cloudinary = require('./upload');
// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploadsChild'); // Directory where uploaded files will be stored
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname); // Use the original file name for the uploaded file
//     }
//   });
  
//   const upload = multer({ storage: storage });

// const getAllChildren = async (req, res) => {
//     try {
//         const children = await Child.find().populate('parents');
//         res.json(children);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// const getChildById = async (req, res) => {
//     try {
//         const child = await Child.findById(req.params.id).populate('parents');
//         if(child){
//             res.json(child);
//         }
//         else{
//             res.status(404).json({ message: 'Kind account is niet gevonden.' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// // exports.uploadChildProfilePicture = async (req, res) => {
// //     await uploadController.handleFileUpload(Child, req, res);
// // };

// exports.uploadChildProfilePicture = async (req, res) => {
//     const userId = req.params.id; // Extract user ID from route parameters
//     if (!userId)
//         return res.status(401).json({ success: false, message: 'User ID not provided!' });

//     try {
//         // Check if the user exists
//         const existingUser = await Child.findById(userId);
//         if (!existingUser) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//         if (!req.file) {
//             return res.status(400).json({ success: false, message: 'No file uploaded' });
//         }

//         // Upload file to Cloudinary
//         const result = await cloudinary.uploader.upload(req.file.path, {
//             public_id: `${userId}_profilePicture`, // Adjust public_id as needed
//             width: 500,
//             height: 500,
//             crop: 'fill',
//         });

//         // Update user's profile picture URL in the database
//         existingUser.profilePicture = result.secure_url;
//         const updatedUser = await existingUser.save();

//         // Return success response with updated user object
//         res.status(201).json({ success: true, message: 'Your profile has been updated!', user: updatedUser });
//     } catch (error) {
//         console.error('Error while uploading parent profile image:', error);
//         res.status(500).json({ success: false, message: 'Server error, please try again later', error: error.message });
//     }
// };

// exports.uploadChildDocument = async (req, res) => {
//     await uploadController.handleFileUpload(Child, req, res);
// };


// // createChild function
// const createChild = async (req, res) => {
//     if (req.user.admin){
//         const { name, parents: parentIds } = req.body; 
//         if (!name) {
//             return res.status(400).json({ message: 'Gebruikersnaam is verplicht.' });
//         }
//         try{
//             //if child already exists
//             const existingChild = await Child.findOne({ name: name });
//             if (existingChild) {
//                 return res.status(400).json({ message: 'Gebruikersnaam van kind bestaat al.' });
//             }
//             // generate a unique code for the child
//             const code = await generateCode();
//             // find parents 
//             const parents = await Parent.find({ _id: { $in: parentIds } });
//             // create child object
//             const child = new Child({
//                 name,
//                 code,
//                 parents: parents.map(parent => parent._id),
//                 profilePicture: profilePicture // Store the Cloudinary URL in the database
//             });
//             // save child
//             const newChild = await child.save();
//             // update parents with new child
//             parents.forEach(async parent => {
//                 parent.children.push(newChild._id);
//                 await parent.save();
//             });
//             res.status(201).json(newChild);
//         }
//         catch(error){
//             res.status(400).json({ message: error.message });
//         }
//     }else {
//         res.status(403).json({ message: 'Je hebt niet de juiste rechten voor deze actie.' });
//     }
// };

// // generateCode function
// function generateCode(){
//     const randomString = Math.random().toString(36).substring(2, 8);
//     return Child.exists({ code: randomString }).then(exists => {
//         if(exists){
//             return generateCode();
//         }
//         return randomString;
//     });
// }

// const checkChildCredentials = async (req, res) => {
//     const { name, code} = req.body;
//     console.log('Received credentials:', name, code);
//     const parentId = req.params.parentId;
//     if (!name || !code) {
//         return res.status(400).json({ message: 'Naam en code zijn verplicht.' });
//     }
//     try{
//      //find child and check credentials
//         const child = await Child.findOne({ name: name, code: code }).populate('parents');
//         if (!child) {
//             return res.status(404).json({ message: 'Onjuiste gegevens.' });
//         } 
//         //find parent
//         const parent = await Parent.findById(parentId);
//         if (!parent) {
//             return res.status(404).json({ message: 'Ouder is niet gevonden.' });
//         }
//         // Check if child is already linked to the parent
//         if (parent.children.includes(child._id)) {
//             return res.status(400).json({ message: 'Kind en ouder zijn al gelinkt.' });
//         }
//         //link parent and child
//         parent.children.push(child._id);
//         await parent.save();
//         child.parents.push(parent._id);
//         await child.save();
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const deleteChild = async (req, res) => {
//     try {
//         const childId = req.params.id;
//         const child = await Child.findById(childId);
//         if(!child){
//             return res.status(404).json({ message: 'Kind account is niet gevonden.' });
//         }
//         await Parent.updateMany(
//             { _id: { $in: child.parents } }, 
//             { $pull: { children: childId } 
//         });
//         await Child.findByIdAndDelete(childId);
//         res.json({ message: 'Kind account is succesvol verwijderd.' });
//     }
//     catch(error){
//         res.status(500).json({ message: error.message });
//     }
// };

// const updateChildUsername = async (req, res) => {
//     const { id } = req.params; // Child ID
//     const { name } = req.body; // New username

//     try {
//         const child = await Child.findById(id);
//         if (!child) {
//             return res.status(404).json({ message: 'Kind account is niet gevonden.' });
//         }

//         child.name = name;
//         const updatedChild = await child.save();

//         res.json(updatedChild);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports.getAllChildren = getAllChildren;
// module.exports.getChildById = getChildById;
// module.exports.createChild = createChild;
// module.exports.deleteChild = deleteChild;
// module.exports.updateChildUsername = updateChildUsername;
// module.exports.checkChildCredentials = checkChildCredentials;