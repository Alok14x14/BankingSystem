const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : [true, 'Email is required to register'],
        unique : [true, 'Email already exists'],
        trim : true,
        lowercase : true,
        match : [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']   
    
    },
    name :{
        type : String,
        required : [true, 'Name is required to register']
    },
    password : {
        type : String,
        required : [true, 'Password is required to register'],
        minLength : [6, 'Password must be at least 6 characters long'],
        select : false
    },
    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
},{
    timestamps: true
})

userSchema.pre('save', async function(){
    if(!this.isModified('password')){
        return
    }
    this.password = await bcrypt.hash(this.password, 12);
    return
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;