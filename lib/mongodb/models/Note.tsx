import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    uid: { 
        type: String, 
        required: true
    },
    title: {
        type: String,
        required: true,
        default: '새 노트'
    },
    content: { 
        type: Array, 
        default: [] 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// uid와 title의 조합으로 고유성 보장
NoteSchema.index({ uid: 1, title: 1 }, { unique: true });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema); 