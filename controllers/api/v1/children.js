const Child = require('../../../models/Child');
const Parent = require('../../../models/Parent');
const Task = require('../../../models/Task');
const cloudinary = require('./upload');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploadsChild');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); 
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

exports.uploadChildProfilePicture = async (req, res) => {
    const childId = req.params.id;

    if (!childId) {
        return res.status(401).json({ success: false, message: 'Child ID not provided!' });
    }

    try {
        const existingChild = await Child.findById(childId);
        if (!existingChild) {
            return res.status(404).json({ success: false, message: 'Child not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            width: 500,
            height: 500,
            crop: 'fill',
        });

        existingChild.profilePicture = result.secure_url;
        const updatedChild = await existingChild.save();

        res.status(201).json({ success: true, message: 'Profile picture updated successfully', updatedChild });
    } catch (error) {
        console.error('Error updating profile picture URL:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile picture URL', error: error.message });
    }
};


exports.uploadChildDocument = async (req, res) => {
    const childId = req.params.id;

    if (!childId) {
        return res.status(400).json({ success: false, message: 'Child ID not provided' });
    }

    try {
        const existingChild = await Child.findById(childId);
        if (!existingChild) {
            return res.status(404).json({ success: false, message: 'Child not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            use_filename: true, 
            unique_filename: false 
        });

        const documentToAdd = {
            name: req.file.originalname,
            url: result.secure_url,
            public_id: result.public_id
        };

        existingChild.document.push(documentToAdd);

        const updatedChild = await existingChild.save();

        res.status(201).json({ success: true, message: 'Document uploaded successfully', child: updatedChild });
    } catch (error) {
        console.error('Error while uploading child document:', error);
        res.status(500).json({ success: false, message: 'Server error, please try again later', error: error.message });
    }
};

exports.deleteChildDocument = async (req, res) => {
    const { childId, documentId } = req.params;

    try {
        const child = await Child.findById(childId);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Kind niet gevonden' });
        }

        const document = child.document.find(doc => doc._id == documentId);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document niet gevonden' });
        }

        const result = await cloudinary.uploader.destroy(document.public_id);

        if (result.result === 'ok') {
            child.document = child.document.filter(doc => doc._id != documentId);
            await child.save();
            return res.status(200).json({ success: true, message: 'Document succesvol verwijderd' });
        } else {
            return res.status(500).json({ success: false, message: 'Er is een probleem opgetreden bij het verwijderen van het document' });
        }
    } catch (error) {
        console.error('Fout bij het verwijderen van het document:', error);
        res.status(500).json({ success: false, message: 'Interne serverfout bij het verwijderen van het document', error: error.message });
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
        const { name, parents: parentIds, profilePicture, avatar, points, managedBy } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Gebruikersnaam is verplicht.' });
        }
        try {
            const existingChild = await Child.findOne({ name: name });
            if (existingChild) {
                return res.status(400).json({ message: 'Gebruikersnaam van kind bestaat al.' });
            }
            const code = await generateCode();
            const parents = await Parent.find({ _id: { $in: parentIds } });
            const child = new Child({
                name,
                code,
                parents: parents.map(parent => parent._id),
                profilePicture: profilePicture,
                avatar: avatar,
                points: points,
                managedBy: managedBy,
            });

            const newChild = await child.save();

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
    const parentId = req.params.parentId;

    if (!name || !code) {
        return res.status(400).json({ message: 'Naam en code zijn verplicht.' });
    }
    try{
        const child = await Child.findOne({ name: name, code: code }).populate('parents');
        if (!child) {
            return res.status(404).json({ message: 'Onjuiste gegevens.' });
        } 

        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Ouder is niet gevonden.' });
        }

        if (parent.children.includes(child._id)) {
            return res.status(400).json({ message: 'Kind en ouder zijn al gelinkt.' });
        }

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
    const { id } = req.params; 
    const { name } = req.body; 

    try {
        const child = await Child.findById(id);
        if (!child) {
            return res.status(404).json({ message: 'Kind account is niet gevonden.' });
        }
        if (child.name === name) {
            return res.status(400).json({ message: 'naam is hetzelfde als huidige naam' });
        }

        child.name = name;
        const updatedChild = await child.save();

        res.json(updatedChild);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateChildProfile = async (req, res) => {
    const { id } = req.params; 
    const { name, profilePicture, avatar } = req.body; 

    try {
        const child = await Child.findById(id);
        if (!child) {
            return res.status(404).json({ message: 'Kind account is niet gevonden.' });
        }

        if (name) child.name = name;
        if (profilePicture) child.profilePicture = profilePicture;
        if (avatar) child.avatar = avatar;

        const updatedChild = await child.save();
        res.json(updatedChild);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateChildAvatar = async (req, res) => {
    const { id } = req.params; 
    const { avatar } = req.body; 

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

        child.adjustBy = child.adjustBy.filter(id => id.toString() !== parentId);
        if (!Array.isArray(child.lookBy)) {
            child.lookBy = [];
        }
        child.lookBy.push(parentId);

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

        child.lookBy = child.lookBy.filter(id => id.toString() !== parentId);
        if (!Array.isArray(child.adjustBy)) {
            child.adjustBy = [];
        }
        child.adjustBy.push(parentId);

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
module.exports.updateChildProfile = updateChildProfile;