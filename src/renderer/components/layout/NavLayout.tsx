import { ReactNode } from "react";

import Sidebar from "../Global/Sidebar";
import MainLayout from "./MainLayout";

type NavLayoutProps = {
    children: ReactNode;
};

const NavLayout = ({ children }: NavLayoutProps) => {
    return (
        <MainLayout>
            <Sidebar />
            {children}
        </MainLayout>
    );
};

export default NavLayout;
