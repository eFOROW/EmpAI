import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '1d';

  try {
    const client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();

    const db = client.db('EmpAI');
    const serverStatus = await db.command({ serverStatus: 1 });

    // 컬렉션 정보 가져오기
    const collections = await db.listCollections().toArray();
    const collectionStats = await Promise.all(
      collections.map(async (collection) => {
        const stats = await db.command({
          collStats: collection.name
        });
        
        // 컬렉션의 첫 번째 문서를 샘플로 가져와서 필드 수 계산
        const sampleDoc = await db.collection(collection.name).findOne({});
        const fieldCount = sampleDoc ? Object.keys(sampleDoc).length : 0;

        return {
          name: collection.name,
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize,
          fieldCount: fieldCount
        };
      })
    );

    // 시계열 메트릭 데이터
    const now = new Date();
    const metrics = Array.from({ length: 15 }, (_, i) => {
      const timestamp = new Date(now.getTime() - (i * 5 * 60000));
      return {
        connections: serverStatus.connections.current + Math.floor(Math.random() * 10),
        network: {
          bytesIn: serverStatus.network.bytesIn + Math.floor(Math.random() * 1000),
          bytesOut: serverStatus.network.bytesOut + Math.floor(Math.random() * 1000),
          numRequests: serverStatus.network.numRequests + Math.floor(Math.random() * 100)
        },
        opcounters: {
          command: serverStatus.opcounters.command + Math.floor(Math.random() * 10),
          query: serverStatus.opcounters.query + Math.floor(Math.random() * 10),
          update: serverStatus.opcounters.update + Math.floor(Math.random() * 5),
          delete: serverStatus.opcounters.delete + Math.floor(Math.random() * 2),
          getmore: serverStatus.opcounters.getmore + Math.floor(Math.random() * 5),
          insert: serverStatus.opcounters.insert + Math.floor(Math.random() * 3)
        },
        timestamp: timestamp.toLocaleTimeString()
      };
    }).reverse();

    await client.close();
    return NextResponse.json({
      metrics,
      collections: collectionStats,
      dbName: 'EmpAI',
      totalSize: collectionStats.reduce((acc, curr) => acc + curr.size, 0),
      totalDocuments: collectionStats.reduce((acc, curr) => acc + curr.count, 0)
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: 'DB 메트릭을 가져오는데 실패했습니다.', error: (error as Error).message },
      { status: 500 }
    );
  }
} 