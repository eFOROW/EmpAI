import mongoose from 'mongoose';
import Interaction from './Interaction';

// 이미지 타입 정의
interface ImageData {
  data?: Buffer;
  thumbnail?: Buffer;
  contentType?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  originalSize?: number;
  compressedSize?: number;
             // URL 필드 추가
  imageType?: string;

}

interface UrlData {
  imgurl: string;
  imageType: string;
}


// Post 인터페이스 정의
export interface IPost extends mongoose.Document {
  title: string;
  content: string;
  category: string;
  author: {
    uid: string;
    name: string;
    email?: string;
  };
  image?: ImageData;
  url?:UrlData;
  views: number;
  likesCount: number;
  commentsCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  increaseView: () => Promise<IPost>;
  updateInteractionCounts: () => Promise<IPost>;
}

// 스키마 정의
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
  image: {
    data: Buffer,          // 압축된 원본 이미지
    thumbnail: Buffer,     // 썸네일 이미지
    contentType: String,   // 이미지 MIME 타    
    imageType: String,
    dimensions: {          // 이미지 크기
      width: Number,
      height: Number
    },
    originalSize: Number,  // 원본 파일 크기
    compressedSize: Number // 압축 후 파일 크기
  },
  url: {
    imgurl: String,
    imageType: String,
  },
  views: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 인덱스 설정
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ category: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'author.uid': 1 });

// 조회수 증가 메서드
postSchema.methods.increaseView = function() {
  this.views += 1;
  return this.save();
};

// 좋아요, 댓글 수 업데이트 메서드
postSchema.methods.updateInteractionCounts = async function() {
  const [likesCount, commentsCount] = await Promise.all([
    Interaction.countDocuments({ postId: this._id, type: 'like' }),
    Interaction.countDocuments({ postId: this._id, type: 'comment' })
  ]);
  
  this.likesCount = likesCount;
  this.commentsCount = commentsCount;
  return this.save();
};

// 가상 필드: 이미지 URL (Base64 또는 외부 URL)
postSchema.virtual('imageUrl').get(function() {
  if (this.image) {
    if (this.image.imageType === 'url' && this.url?.imgurl) {
      return this.url.imgurl;
    } else if (this.image.data) {
      return `data:${this.image.contentType};base64,${this.image.data.toString('base64')}`;
    }
  }
  return null;
});

// 가상 필드: 썸네일 URL (Base64)
postSchema.virtual('thumbnailUrl').get(function() {
  if (this.image && this.image.thumbnail) {
    return `data:${this.image.contentType};base64,${this.image.thumbnail.toString('base64')}`;
  }
  return null;
});

// toJSON 설정
postSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.image?.data;
    delete ret.image?.thumbnail;
    return ret;
  }
});

postSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.image?.data;
    delete ret.image?.thumbnail;
    return ret;
  }
});

// 모델 생성 및 내보내기
const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;