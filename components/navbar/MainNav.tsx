import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ModeToggle } from "./ModeToggle";

const MainNav = () => {
  return (
    <Menubar className="m-4">
      {/* //////////////////////////////////// */}
      <div className="ml-auto"></div>
      <MenubarMenu>
        <MenubarTrigger>
          <div className="p-2 rounded-md ">File</div>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem>
              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>New Window</MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarItem>Share</MenubarItem>
            <MenubarItem>Print</MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      {/* //////////////////////////////////// */}
      <ModeToggle />
    </Menubar>
  );
};

export default MainNav;
