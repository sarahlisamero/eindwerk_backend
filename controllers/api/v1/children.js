const Child = require('../../../models/Child');
const Parent = require('../../../models/Parent');
const Task = require('../../../models/Task');

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

const createChild = async (req, res) => {
    const { name, code, parents: parentIds } = req.body; 

    try{
        const parents = await Parent.find({ _id: { $in: parentIds } });
        const child = new Child({
            name,
            code,
            parents: parents.map(parent => parent._id)
        });
        const newChild = await child.save();
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


module.exports.getAllChildren = getAllChildren;
module.exports.getChildById = getChildById;
module.exports.createChild = createChild;