import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    uid: { 
        type: String, 
        required: true, 
        unique: true 
    },
    content: { 
        type: Array, 
        default: [] 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

export default mongoose.models.Note || mongoose.model('Note', NoteSchema); 