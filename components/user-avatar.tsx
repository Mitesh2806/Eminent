import { useUser } from "@clerk/nextjs"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export const UserAvatar = () => {
    const {user} = useUser()
    return (
        <Avatar className="h-10 w-10">
            <AvatarImage src={user?.imageUrl}/>
            <AvatarFallback>
                {user?.fullName?.charAt(0)}
                {user?.lastName?.charAt(0)}
            </AvatarFallback>
        </Avatar>
    )
};