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
      <div className="border rounded-lg p-4 my-2 hover:bg-gray-50">
        <a href={block.props.url} target="_blank" rel="noopener noreferrer" className="no-underline">
          <div className="flex gap-4">
            {block.props.image && (
              <div className="w-[100px] h-[100px] relative">
                <Image 
                  src={block.props.image} 
                  alt=""
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-medium text-blue-600 mb-1">{block.props.title || block.props.url}</h3>
              {block.props.description && (
                <p className="text-gray-600 text-sm line-clamp-2">{block.props.description}</p>
              )}
              <p className="text-gray-400 text-xs mt-2">{new URL(block.props.url).hostname}</p>
            </div>
          </div>
        </a>
      </div>
    ),
  }
);
