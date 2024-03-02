const handleProfilePictureUpload = async (model, req, res) => {
    try {
        const document = await model.findById(req.params.id);
        if (!document) {
            return res.status(404).send(`${model.modelName} not found`);
        }
        document.profilePicture = req.file.path;
        await document.save();
        res.send(`Profile picture uploaded for ${model.modelName.toLowerCase()} successfully`);
    } catch (error) {
        console.error(`Error uploading ${model.modelName.toLowerCase()} profile picture:`, error);
        res.status(500).send('Internal server error');
    }
};

module.exports = { handleProfilePictureUpload };
