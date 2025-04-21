"use client";
import Image from "next/image";
import Link from "next/link";
import { AudioWaveform, LucideMenu, LucideTestTube, LucideSettings2, LucideSpeaker, LucideVideotape, LucideBookImage } from "lucide-react";
import { usePathname } from "next/navigation";
const routes = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LucideMenu
    },
    {
        label: "Speech to Text",
        href: "/speech-assignment",
        icon: AudioWaveform
    },
    {
        label: "CreateCourse",
        href: "/create",
        
        icon: LucideTestTube
    },
    {
        label: "Concept Visualizer",
        href: "/visualize",
        
        icon: LucideVideotape
    },
    {
        label: "Learn with PDF",
        href: "/learnwithpdf",
        
        icon: LucideBookImage
    },
    // {
    //     label: 'Chat',
    //     href: '/chat',
    //     icon: LucideSpeaker
    //   },
    {
        label: "Settings",
        href: "/settings",
        icon: LucideSettings2
    },
]
const Sidebar = () => {
    const pathname = usePathname();
    const cn = (...classes: string[]) => {
        return classes.filter(Boolean).join(' ');
    };

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <Image
                            fill
                            alt="Logo"
                            src="/globe.svg">

                        </Image>
                    </div>
                    <h1 className="text-xl font-bold">CalenterAI</h1>
                </Link>
                <div className="space-y-1"> {/* Fixed typo in className from space=y-1 to space-y-1 */}
    {routes.map((route) => (
        <Link 
            key={route.href}
            href={route.href}
            className={cn(
                "flex items-center text-sm group p-3 w-full justify-start font-medium cursor-pointer hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition",
                pathname === route.href ? "text-yellow-400 bg-yellow-400/10" : "text-zinc-400"
            )}
        >
            <div className="flex items-center flex-1">
                <route.icon className="h-5 w-5 mr-3" />
                {route.label}
            </div>
        </Link>
    ))}
</div>
            </div>
        </div>
    );
};

export default Sidebar;