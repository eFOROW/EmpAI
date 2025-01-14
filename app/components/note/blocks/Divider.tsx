import { createReactBlockSpec } from "@blocknote/react";

export const Divider = createReactBlockSpec(
  {
    type: "divider",
    propSchema: {},
    content: "none",
  },
  {
    render: () => {
      return (
        <div className="w-[80%] py-2">
          <hr className="border-0 h-[2px] bg-gray-200 dark:bg-gray-700" />
        </div>
      );
    },
  }
); 