const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'profilePicture') {
            cb(null, 'uploads/profilePictures/');
        } else if (file.fieldname === 'document') {
            cb(null, 'uploads/documents/');
        } else if (file.fieldname === 'taskPicture') {
            cb(null, 'uploads/taskPictures/');
        } else {
            cb(new Error('Invalid fieldname'));
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

const upload = multer({ storage: storage });

module.exports = upload;



