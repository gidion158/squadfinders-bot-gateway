import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Players
const PlayerSchema = new mongoose.Schema({
    message_id: {
        type: Number, required: true, unique: true, index: true
    },
    message_date: {type: Date, required: true},
    sender: {
        id: {type: String, default: null},
        username: {type: String, default: null},
        name: {type: String, default: null},
        gender: {
            type: String,
            enum: ['unknown', 'male', 'female', 'other'],
            default: 'unknown'
        }
    },
    group: {
        group_id: {type: String, default: null},
        group_title: {type: String, default: null},
        group_username: {type: String, default: null}
    },
    message: {type: String, default: null},
    platform: {
        type: String,
        enum: ['PC', 'Console', 'unknown'],
        default: 'unknown'
    },
    rank: {type: String, default: null},
    players_count: {type: Number, default: null},
    game_mode: {
        type: String, default: 'unknown'
    },
    active: {type: Boolean, default: false}
}, {timestamps: true});

// An index in MongoDB is a data structure that improves the speed of data retrieval operations on a collection.
PlayerSchema.index({'group.group_id': 1, message_id: 1}, {unique: true});

const Player = mongoose.model('Player', PlayerSchema);


// ADMIN USER MODEL
const AdminUserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ['admin', 'viewer'], required: true}
});

// Signal pre-save
// Hash the password before saving the user to the database
AdminUserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

export {Player, AdminUser};