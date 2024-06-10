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
    const childId = req.params.id;

    if (!childId) {
        return res.status(400).json({ success: false, message: 'Child ID not provided' });
    }

    try {
        // Retrieve childId from the request parameters and validate it
        const existingChild = await Child.findById(childId);
        if (!existingChild) {
            return res.status(404).json({ success: false, message: 'Child not found' });
        }

        // Check if a file is uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        // Save document details to the existing child
        existingChild.document.push({
            url: result.secure_url,
            public_id: result.public_id
        });

        // Save the updated child
        const updatedChild = await existingChild.save();

        // Respond with success message and updated child details
        res.status(201).json({ success: true, message: 'Document uploaded successfully', child: updatedChild });
    } catch (error) {
        console.error('Error while uploading child document:', error);
        res.status(500).json({ success: false, message: 'Server error, please try again later', error: error.message });
    }
};


exports.getChildDocuments = async (req, res) => {
    try {
        const childId = req.params.id;
        const child = await Child.findById(childId);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found' });
        }
        const documents = child.document;
        res.status(200).json({ success: true, documents });
    } catch (error) {
        console.error('Error fetching child documents:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};





// Create a new child
const createChild = async (req, res) => {
    if (req.user.admin) {
        const { name, parents: parentIds, profilePicture, avatar, points, managedBy } = req.body; // Include profilePicture in the request body
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
                profilePicture: profilePicture, // Store the Cloudinary URL in the database
                avatar: avatar,
                points: points,
                managedBy: managedBy,
            });
            // Save child
            const newChild = await child.save();
            // Update parents with new child
            parents.forEach(async parent => {
                parent.children.push(newChild._id);
                parent.managedChildren.push(newChild._id);
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
        parent.adjustChildren.push(child._id);
        await parent.save();
        
        child.adjustBy.push(parent._id);
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

const updateChildProfile = async (req, res) => {
    const { id } = req.params; // Child ID
    const { name, profilePicture, avatar } = req.body; // Nieuwe gegevens

    try {
        const child = await Child.findById(id);
        if (!child) {
            return res.status(404).json({ message: 'Kind account is niet gevonden.' });
        }

        // Update velden alleen als ze aanwezig zijn in de request body
        if (name) child.name = name;
        if (profilePicture) child.profilePicture = profilePicture;
        if (avatar) child.avatar = avatar;

        const updatedChild = await child.save();
        res.json(updatedChild);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.updateChildProfile = updateChildProfile;


const updateChildAvatar = async (req, res) => {
    const { id } = req.params; // Child ID
    const { avatar } = req.body; // New avatar URL

    try {
        const child = await Child.findById(id);
        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        child.avatar = avatar;
        const updatedChild = await child.save();

        res.json(updatedChild);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePoints = async (req, res) => {
    const { id } = req.params;
    const { points } = req.body;
  
    try {
      const child = await Child.findById(id);
      if (!child) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      child.points -= points;
      await child.save();
  
      res.status(200).json({ message: 'Points updated successfully', points: child.points });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  const addPoints = async (req, res) => {
    const { id } = req.params;
    const { points } = req.body;

    try {
        const child = await Child.findById(id);
        if (!child) {
            return res.status(404).json({ message: 'User not found' });
        }

        child.points += points;
        await child.save();

        res.status(200).json({ message: 'Points added successfully', points: child.points });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
 };

 const moveChildToLookBy = async (req, res) => {
    const { childId, parentId } = req.params;

    try {
        const child = await Child.findById(childId);
        if (!child) {
            return res.status(404).json({ message: 'Child not found.' });
        }

        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found.' });
        }

        // Remove childId from adjustBy and add to lookBy
        child.adjustBy = child.adjustBy.filter(id => id.toString() !== parentId);
        if (!Array.isArray(child.lookBy)) {
            child.lookBy = [];
        }
        child.lookBy.push(parentId);

        // Remove childId from adjustChildren and add to lookChildren
        parent.adjustChildren = parent.adjustChildren.filter(id => id.toString() !== childId);
        if (!Array.isArray(parent.lookChildren)) {
            parent.lookChildren = [];
        }
        parent.lookChildren.push(childId);

        await Promise.all([child.save(), parent.save()]);

        res.status(200).json({ message: 'Child moved to lookBy and parent moved to lookChildren successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const moveChildToAdjust = async (req, res) => {
    const { childId, parentId } = req.params;

    try {
        const child = await Child.findById(childId);
        if (!child) {
            return res.status(404).json({ message: 'Child not found.' });
        }

        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found.' });
        }

        // Remove parentId from lookBy and add to adjustBy
        child.lookBy = child.lookBy.filter(id => id.toString() !== parentId);
        if (!Array.isArray(child.adjustBy)) {
            child.adjustBy = [];
        }
        child.adjustBy.push(parentId);

        // Remove childId from lookChildren and add to adjustChildren
        parent.lookChildren = parent.lookChildren.filter(id => id.toString() !== childId);
        if (!Array.isArray(parent.adjustChildren)) {
            parent.adjustChildren = [];
        }
        parent.adjustChildren.push(childId);

        await Promise.all([child.save(), parent.save()]);

        res.status(200).json({ message: 'Child moved to adjustBy and parent moved to adjustChildren successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getAllChildren = getAllChildren;
module.exports.getChildById = getChildById;
module.exports.createChild = createChild;
module.exports.deleteChild = deleteChild;
module.exports.updateChildUsername = updateChildUsername;
module.exports.checkChildCredentials = checkChildCredentials;
module.exports.updateChildAvatar = updateChildAvatar;
module.exports.updatePoints = updatePoints;
module.exports.addPoints = addPoints;
module.exports.moveChildToLookBy = moveChildToLookBy;
module.exports.moveChildToAdjust = moveChildToAdjust;


















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
