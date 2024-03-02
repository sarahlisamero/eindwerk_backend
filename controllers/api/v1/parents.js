const Parent = require('../../../models/Parent');
const Child = require('../../../models/Child');
const Task = require('../../../models/Task');
const { handleProfilePictureUpload } = require ('../../../controllers/api/v1/upload');

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

module.exports.getAllParents = getAllParents;
module.exports.getParentById = getParentById;
module.exports.createParent = createParent;
