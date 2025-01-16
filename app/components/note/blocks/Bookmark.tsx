import { createReactBlockSpec } from "@blocknote/react";
import Image from 'next/image';

export const Bookmark = createReactBlockSpec(
  {
    type: "bookmark",
    propSchema: {
      url: { default: "" },
      title: { default: "" },
      description: { default: "" },
      image: { default: "" }
    },
    content: "none",
  },
  {
    render: ({ block }) => (
      <div className="border rounded-lg my-2 max-w-[60%] hover:bg-gray-50">
        <a href={block.props.url} target="_blank" rel="noopener noreferrer" className="no-underline">
          <div className="flex gap-6">
            {block.props.image && (
              <div className="w-[20vh] aspect-[2/1] max-w-[35%] relative overflow-hidden">
                <Image 
                  src={block.props.image}
                  alt={block.props.title || "북마크 이미지"}
                  className="object-cover rounded"
                  fill
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1 p-4 max-w-[50vh]">
              <h3 className="font-medium text-blue-600 mb-1">{block.props.title || block.props.url}</h3>
              {block.props.description && (
                <p className="text-gray-400 text-xs line-clamp-2">{block.props.description}</p>
              )}
              <p className="text-gray-600 text-xs mt-2">{new URL(block.props.url).hostname}</p>
            </div>
          </div>
        </a>
      </div>
    ),
  }
);