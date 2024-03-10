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

// isChildExisting function
const isChildExisting = async (req, res) => {
    const { name, code, parents: parentIds } = req.body; 

    try {
        // Check if a child with the given name and code exists
        const existingChild = await Child.findOne({ name, code });

        if (existingChild) {
            // If child with the given name and code already exists, link it to the parent(s)
            // Clear the existing parent references
            existingChild.parents = [];

            // Find parents 
            const parents = await Parent.find({ _id: { $in: parentIds } });

            // Link child to parent and parent to child
            const promises = parents.map(async parent => {
                parent.children.push(existingChild._id);
                existingChild.parents.push(parent._id);
                await parent.save(); // Save the parent
            });

            await Promise.all(promises);

            // Save the child after all parent links have been established
            await existingChild.save();

            res.status(201).json(existingChild);
        } else {
            // If child with the given name and code does not exist, return an error response
            res.status(400).json({ message: "Child with the provided name and code does not exist." });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
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
        res.json({ message: 'Child deleted successfully' });
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
module.exports.isChildExisting = isChildExisting;