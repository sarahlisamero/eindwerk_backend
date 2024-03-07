const Parent = require('../../../models/Parent');
const Child = require('../../../models/Child');
const Task = require('../../../models/Task');
const { handleProfilePictureUpload } = require ('../../../controllers/api/v1/upload');
const bcrypt = require('bcrypt');

const signup = async (req, res) => {
    const { username, password, admin } = req.body;

    try {
        const existingParent = await Parent.findOne({ username });
        if (existingParent) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

        const parent = new Parent({ username, password: hashedPassword, admin });
        const newParent = await parent.save();

        res.status(201).json(newParent);
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
            res.status(404).json({ message: 'Parent not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.uploadParentProfilePicture = async (req, res) => {
    await handleProfilePictureUpload(Parent, req, res);
};


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
        res.json({ message: 'Parent deleted successfully' });
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