const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;



// const handleFileUpload = async (model, req, res) => {
//     try {
//         const instance = await model.findById(req.params.id);
//         if (!instance) {
//             return res.status(404).send(`${model.modelName} not found`);
//         }
//         if(req.file.fieldname === 'document'){
//             instance.document.push(req.file.path);
//         }
//         else{
//             instance[req.file.fieldname] = req.file.path;
//         }
//         await instance.save();
//         res.send(`${req.file.fieldname} uploaded for ${model.modelName.toLowerCase()} successfully`);
//     } catch (error) {
//         console.error(`Error uploading ${req.file.fieldname} for ${model.modelName.toLowerCase()}:`, error);
//         res.status(500).send('Internal server error');
//     }
// };

// module.exports = { handleFileUpload };
