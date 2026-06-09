import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <CardContent className="p-5 flex-1 flex flex-col gap-3 mt-2">
            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-3 w-12 mb-2" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-5 py-4 border-t bg-muted/30 flex items-center justify-between gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
