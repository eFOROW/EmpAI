import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  type: {
    type: String,
    enum: ['comment', 'like'],
    required: true
  },
  content: {
    type: String,
    required: function(this: { type: string }) {
      return this.type === 'comment';
    },
    trim: true
  },
  author: {
    uid: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

interactionSchema.index({ postId: 1, type: 1 });
interactionSchema.index({ 'author.uid': 1 });
interactionSchema.index({ createdAt: -1 });

export interface IInteraction extends mongoose.Document {
  postId: mongoose.Types.ObjectId;
  type: 'comment' | 'like';
  content?: string;
  author: {
    uid: string;
    name: string;
    email?: string;
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Interaction = mongoose.models.Interaction || mongoose.model<IInteraction>('Interaction', interactionSchema);

export default Interaction;