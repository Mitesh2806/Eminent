import { Loader2 } from "lucide-react";


export const  Loader = () => {
  return (
    <div className="h-full gap-y-4 flex flex-col items-center">
        <div className="w-10 h-10 relative animate-spin">
        <Loader2/>
        </div>
        <p className="text-sm text-muted-foreground">Thinking....</p>
    </div>
  )
}

