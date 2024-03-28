const Child = require('../../../models/Child');
const Parent = require('../../../models/Parent');
const Task = require('../../../models/Task');
const uploadController = require('./upload');

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
            res.status(404).json({ message: 'Child not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.uploadChildProfilePicture = async (req, res) => {
    await uploadController.handleFileUpload(Child, req, res);
};

exports.uploadChildDocument = async (req, res) => {
    await uploadController.handleFileUpload(Child, req, res);
};


// createChild function
const createChild = async (req, res) => {
    if (req.user.admin){
        const { name, parents: parentIds } = req.body; 

        try{
            // generate a unique code for the child
            const code = await generateCode();
            // find parents 
            const parents = await Parent.find({ _id: { $in: parentIds } });
            // create child object
            const child = new Child({
                name,
                code,
                parents: parents.map(parent => parent._id)
            });
            // save child
            const newChild = await child.save();
            // update parents with new child
            parents.forEach(async parent => {
                parent.children.push(newChild._id);
                await parent.save();
            });
            res.status(201).json(newChild);
        }
        catch(error){
            res.status(400).json({ message: error.message });
        }
    }else {
        res.status(403).json({ message: 'Forbidden: Only parents can create children' });
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
            return res.status(404).json({ message: 'Invalid credentials.' });
        } 
        //find parent
        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found.' });
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
            return res.status(404).json({ message: 'Child not found' });
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
            return res.status(404).json({ message: 'Child not found' });
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