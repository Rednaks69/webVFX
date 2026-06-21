import { Button } from "../ui/button";

const MenuRenderer = () => {
  return (
    <div
      className="flex items-center justify-between 
    gap-1 border border-gray-400 p-2 rounded-2xl">
      <Button
        className="bg-gray-200 dark:bg-[#3b3b3b10] text-gray-600 dark:text-white 
      rounded-md hover:bg-accent hover:text-black dark:hover:bg-[#3b3b3b40] 
      focus:bg-fuchsia-500 focus:text-white dark:focus:bg-fuchsia-500 dark:focus:border">
        2D
      </Button>
      <Button
        className="bg-gray-200 dark:bg-[#3b3b3b10] text-gray-600 dark:text-white 
      rounded-md hover:bg-accent hover:text-black dark:hover:bg-[#3b3b3b40] 
      focus:bg-fuchsia-500 focus:text-white dark:focus:bg-fuchsia-500 dark:focus:border">
        3D
      </Button>
      <Button
        className="bg-gray-200 dark:bg-[#3b3b3b10] text-gray-600 dark:text-white 
      rounded-md hover:bg-accent hover:text-black dark:hover:bg-[#3b3b3b40] 
      focus:bg-fuchsia-500 focus:text-white dark:focus:bg-fuchsia-500 dark:focus:border">
        2D-{">"}3D
      </Button>
      <Button
        className="bg-gray-200 dark:bg-[#3b3b3b10] text-gray-600 dark:text-white 
      rounded-md hover:bg-accent hover:text-black dark:hover:bg-[#3b3b3b40] 
      focus:bg-fuchsia-500 focus:text-white dark:focus:bg-fuchsia-500 dark:focus:border">
        Auto
      </Button>
    </div>
  );
};

export default MenuRenderer;
