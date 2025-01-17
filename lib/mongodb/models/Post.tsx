import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '제목을 입력해주세요.'],
    trim: true,
    maxlength: [100, '제목은 100자 이내로 작성해주세요.']
  },
  content: {
    type: String,
    required: [true, '내용을 입력해주세요.'],
    trim: true
  },
  category: {
    type: String,
    enum: ['tech', 'career', 'interview', 'life'],
    required: [true, '카테고리를 선택해주세요.']
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
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: [String],
    default: []
},
  comments: [{
    content: {
      type: String,
      required: true
    },
    author: {
      uid: String,
      name: String,
      email: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true  // createdAt, updatedAt 자동 생성
});

// 인덱스 설정
postSchema.index({ title: 'text', content: 'text' });  // 텍스트 검색을 위한 인덱스
postSchema.index({ category: 1 });  // 카테고리 검색 최적화
postSchema.index({ createdAt: -1 }); // 최신순 정렬 최적화
postSchema.index({ 'author.uid': 1 }); // 작성자 검색 최적화

// 가상 필드 설정
postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// 메서드 설정
postSchema.methods.increaseView = function() {
  this.views += 1;
  return this.save();
};

postSchema.methods.toggleLike = function(uid: string) {
  const index = this.likes.indexOf(uid);
  if (index > -1) {
    this.likes.splice(index, 1); // 좋아요 취소
  } else {
    this.likes.push(uid); // 좋아요 추가
  }
  return this.save();
};

export interface IPost extends mongoose.Document {
  title: string;
  content: string;
  category: string;
  author: {
    uid: string;
    name: string;
    email?: string;
  };
  views: number;
  likes: string[];
  comments: Array<{
    content: string;
    author: {
      uid: string;
      name: string;
      email?: string;
    };
    createdAt: Date;
  }>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  commentsCount: number;
  likesCount: number;
  increaseView: () => Promise<IPost>;
  toggleLike: (uid: string) => Promise<IPost>;
}

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;