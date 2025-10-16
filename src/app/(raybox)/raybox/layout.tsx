import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";

const RayboxLayout = ({ children }: Readonly<{
    children: ReactNode
}>) => {
    return (
        <SidebarProvider>
            <div className={`grid grid-cols-[auto_1fr] h-screen w-full`}>
                <div>
                    <AppSidebar />
                </div>
                <main>
                    {children}
                </main>
                <Toaster />
            </div>
        </SidebarProvider>
    );
};

export default RayboxLayout;