import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const StudentDashboardLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <div className="h-screen min-h-screen ">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[50] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72">
                <Navbar />
                <div className="h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboardLayout;