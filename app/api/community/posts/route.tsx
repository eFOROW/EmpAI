// /app/api/community/posts/route.ts

import { NextResponse } from 'next/server';
import connectToDatabase from "@/lib/mongodb/mongodb";
import Post from '@/lib/mongodb/models/Post';
import Interaction from '@/lib/mongodb/models/Interaction';
import { verifyAuth } from "@/lib/firebase/auth_middleware";
import Sharp from 'sharp';
import { SortOrder } from 'mongoose';
// Sharp 설정 최적화
Sharp.cache(false);
Sharp.concurrency(1);

// 이미지 압축 및 처리 함수
async function processImage(buffer: Buffer) {
  try {
    // 메타데이터 확인
    const metadata = await Sharp(buffer).metadata();
    
    // 최적 크기 계산 (16:9 비율 유지)
    const MAX_WIDTH = 1280;  // 일반적인 디스플레이에 적합
    const MAX_HEIGHT = 720;  // 16:9 비율
    let width = metadata.width;
    let height = metadata.height;
    
    if (width && height) {
      const aspectRatio = width / height;
      
      // 가로가 더 긴 경우
      if (aspectRatio > 16/9) {
        if (width > MAX_WIDTH) {
          width = MAX_WIDTH;
          height = Math.round(width / aspectRatio);
        }
      } 
      // 세로가 더 긴 경우
      else {
        if (height > MAX_HEIGHT) {
          height = MAX_HEIGHT;
          width = Math.round(height * aspectRatio);
        }
      }
    }

    // Sharp 인스턴스 재사용
    const sharpInstance = Sharp(buffer);
    
    // 원본 이미지 최적화
    const compressedImage = await sharpInstance
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 75,
        progressive: true,
        chromaSubsampling: '4:2:0',
        mozjpeg: true,
        optimizeScans: true
      })
      .toBuffer();

    // 썸네일 생성
    const thumbnail = await Sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'attention',
        kernel: 'lanczos3'
      })
      .jpeg({
        quality: 60,
        progressive: true,
        chromaSubsampling: '4:2:0'
      })
      .toBuffer();

    return {
      data: compressedImage,
      thumbnail,
      width,
      height,
      originalSize: buffer.length,
      compressedSize: compressedImage.length
    };

  } catch (error) {
    console.error('이미지 처리 중 오류:', error);
    throw new Error('이미지 처리에 실패했습니다.');
  }
}


export async function POST(request: Request) {
  try {
    const decodedToken = await verifyAuth();
    const formData = await request.formData();
    
    const imageType = formData.get('imageType');
    let imageData = null;
    let urlData = null;
    
    console.log('받은 이미지 타입:', imageType);
    
    if (imageType === 'file') {
      const imageFile = formData.get('image') as File | null;
      if (imageFile) {
        if (imageFile.size > 2 * 1024 * 1024) {
          return NextResponse.json({
            message: "이미지 크기는 2MB 이하여야 합니다."
          }, { status: 400 });
        }
        
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const processedImage = await processImage(buffer);
        
        imageData = {
          data: processedImage.data,
          thumbnail: processedImage.thumbnail,
          contentType: 'image/jpeg',
          dimensions: {
            width: processedImage.width,
            height: processedImage.height
          },
          originalSize: processedImage.originalSize,
          compressedSize: processedImage.compressedSize,
          imageType: 'file'
        };
      }
    } else if (imageType === 'url') {
      const imageUrl = formData.get('imageUrl') as string;
      console.log('받은 이미지 URL:', imageUrl);
      
      if (imageUrl) {
        try {
          const response = await fetch(imageUrl);
          const contentType = response.headers.get('content-type');
          
          if (!contentType?.startsWith('image/')) {
            return NextResponse.json({
              message: "유효한 이미지 URL이 아닙니다."
            }, { status: 400 });
          }
          
          urlData = {
            imgurl: imageUrl,
            imageType: 'url'
          };
          
          // 기본 이미지 메타데이터 설정
          imageData = {
            contentType: contentType,
            dimensions: {
              width: 0,
              height: 0
            },
            imageType: 'url'
          };
        } catch (error) {
          console.error('URL 파싱 에러:', error);
          return NextResponse.json({
            message: "유효하지 않은 이미지 URL입니다."
          }, { status: 400 });
        }
      }
    }
    
    const postData = {
      title: formData.get('title'),
      content: formData.get('content'),
      category: formData.get('category'),
      author: {
        uid: decodedToken.uid,
        name: formData.get('authorName'),
        email: decodedToken.email
      },
      image: imageData,
      url: urlData,
      likesCount: 0,
      commentsCount: 0,
      views: 0,
      isDeleted: false
    };
    console.log(urlData)
    await connectToDatabase();
    const newPost = new Post(postData);
    const savedPost = await newPost.save();
    
    return NextResponse.json(savedPost, { status: 201 });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      message: "게시글 작성 실패",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const decodedToken = await verifyAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;
    
    await connectToDatabase();

    if (id) {
      const post = await Post.findById(id);
      if (!post || post.isDeleted) {
        return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
      }
      await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });
      
      const [likesCount, commentsCount] = await Promise.all([
        Interaction.countDocuments({ postId: id, type: 'like' }),
        Interaction.countDocuments({ postId: id, type: 'comment' })
      ]);
      
      let processedPost = post.toObject();
      if (processedPost.url?.imgurl) {
        processedPost.imageUrl = processedPost.url.imgurl;
      } else if (processedPost.image?.data) {
        processedPost.imageUrl = `data:${processedPost.image.contentType};base64,${processedPost.image.data.toString('base64')}`;
        if (processedPost.image.thumbnail) {
          processedPost.thumbnailUrl = `data:${processedPost.image.contentType};base64,${processedPost.image.thumbnail.toString('base64')}`;
        }
      }
      
      return NextResponse.json({ ...processedPost, likesCount, commentsCount });
    }

    const query: any = { isDeleted: false };
    const searchType = searchParams.get('searchType');
    const searchQuery = searchParams.get('searchQuery');
    const sortBy = searchParams.get('sortBy');
    const category = searchParams.get('category');
    
    if (searchQuery) {
      query[searchType === 'author' ? 'author.name' : searchType || 'title'] = { 
        $regex: searchQuery, 
        $options: 'i' 
      };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const sort: { [key: string]: SortOrder } = {
      [sortBy === 'likes' ? 'likesCount' : sortBy === 'views' ? 'views' : 'createdAt']: -1 as SortOrder
    };

    const [totalCount, posts] = await Promise.all([
      Post.countDocuments(query),
      Post.find(query).sort(sort).skip(skip).limit(limit)
    ]);

    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const [likesCount, commentsCount] = await Promise.all([
        Interaction.countDocuments({ postId: post._id, type: 'like' }),
        Interaction.countDocuments({ postId: post._id, type: 'comment' })
      ]);
      
      let postObj = post.toObject();
      
      if (postObj.url?.imgurl) {
        postObj.imageUrl = postObj.url.imgurl;
      } else if (postObj.image?.thumbnail) {
        postObj.thumbnailUrl = `data:${postObj.image.contentType};base64,${postObj.image.thumbnail.toString('base64')}`;
      }

      return {
        ...postObj,
        likesCount,
        commentsCount
      };
    }));

    return NextResponse.json({
      posts: postsWithCounts,
      total: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: (page * limit) < totalCount
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: "요청 처리 실패", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const decodedToken = await verifyAuth();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    
    if (!postId) {
      return NextResponse.json({ message: "게시글 ID가 필요합니다." }, { status: 400 });
    }

    const formData = await request.formData();
    await connectToDatabase();
    
    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (post.author.uid !== decodedToken.uid) {
      return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
    }

    // 업데이트 객체 동적 생성
    const updateData: any = {
      title: formData.get('title'),
      content: formData.get('content'),
      category: formData.get('category')
    };

    // 이미지 처리 플래그
    const keepExistingImage = formData.get('keepExistingImage') === 'true';
    const removeImage = formData.get('removeImage') === 'true';
    const imageType = formData.get('imageType');

    // 이미지 처리 로직
    if (removeImage) {
      // 이미지 삭제
      updateData.$unset = { image: 1, url: 1 };
    } else if (keepExistingImage) {
      // 기존 이미지 유지 (이미지 필드 업데이트 안함)
    } else {
      // 새 이미지 처리
      let imageData = null;
      let urlData = null;

      if (imageType === 'file') {
        const imageFile = formData.get('image') as File | null;
        if (imageFile) {
          if (imageFile.size > 2 * 1024 * 1024) {
            return NextResponse.json({ 
              message: "이미지 크기는 2MB 이하여야 합니다." 
            }, { status: 400 });
          }

          const buffer = Buffer.from(await imageFile.arrayBuffer());
          const processedImage = await processImage(buffer);
          
          imageData = {
            data: processedImage.data,
            thumbnail: processedImage.thumbnail,
            contentType: 'image/jpeg',
            dimensions: {
              width: processedImage.width,
              height: processedImage.height
            },
            originalSize: processedImage.originalSize,
            compressedSize: processedImage.compressedSize,
            imageType: 'file'
          };
        }
      } else if (imageType === 'url') {
        const imageUrl = formData.get('imageUrl') as string;
        if (imageUrl) {
          try {
            const response = await fetch(imageUrl);
            const contentType = response.headers.get('content-type');
            
            if (!contentType?.startsWith('image/')) {
              return NextResponse.json({ 
                message: "유효하지 않은 이미지 URL입니다." 
              }, { status: 400 });
            }
            
            urlData = {
              imgurl: imageUrl,
              imageType: 'url'
            };
            
            imageData = {
              contentType,
              dimensions: { width: 0, height: 0 },
              imageType: 'url'
            };
          } catch (error) {
            return NextResponse.json({ 
              message: "유효하지 않은 이미지 URL입니다." 
            }, { status: 400 });
          }
        }
      }

      // 이미지 필드 업데이트
      if (imageData || urlData) {
        updateData.image = imageData;
        updateData.url = urlData;
      }
    }

    // MongoDB 업데이트 작업
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      Object.keys(updateData).includes('$unset') 
        ? updateData // $unset 연산자 사용
        : { $set: updateData }, // 일반 업데이트
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedPost);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: "게시글 수정 실패", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const decodedToken = await verifyAuth();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ message: "게시글 ID가 필요합니다." }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (post.author.uid !== decodedToken.uid) {
      return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
    }

    post.isDeleted = true;
    await post.save();
    return NextResponse.json({ message: "게시글이 삭제되었습니다." });

  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "게시글 삭제 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}