const Joi = require('joi');


const registerValidation = (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().min(4).required(),
        DOB: Joi.date().required(),
        name: Joi.string().min(6).required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(6).required(),
        profile: Joi.string().uri().default("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: "Bad request", error
        })
    }
    req.body = value;
    next()
};
const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        usernameOrEmail: Joi.string().required(),
        password: Joi.string().required()
    }).or("usernameOrEmail");
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: "Bad request", error
        })
    }
    next()
};


module.exports = {
    registerValidation,
    loginValidation
}


