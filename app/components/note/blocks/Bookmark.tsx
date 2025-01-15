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
      <div className="border rounded-lg my-2 hover:bg-gray-50">
        <a href={block.props.url} target="_blank" rel="noopener noreferrer" className="no-underline">
          <div className="flex gap-6">
            {block.props.image && (
              <div className="w-[20vh] h-auto relative">
                <Image 
                  src={block.props.image} 
                  alt=""
                  fill
                  className="object-cover rounded"
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