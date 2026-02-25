export default function LoadingSkeleton({ teamName }) {
  return (
    <div aria-busy="true" aria-label={`Loading ${teamName} data`} className="space-y-4">
      {/* Banner Skeleton */}
      <div className="px-6 py-4 bg-gray-200 rounded-lg animate-pulse h-24"></div>

      {/* Card Skeleton 1 */}
      <div className="px-4 py-4 bg-gray-100 rounded-lg animate-pulse h-32"></div>

      {/* Card Skeleton 2 */}
      <div className="px-4 py-4 bg-gray-100 rounded-lg animate-pulse h-32"></div>

      {/* Card Skeleton 3 */}
      <div className="px-4 py-4 bg-gray-100 rounded-lg animate-pulse h-40"></div>

      {/* Card Skeleton 4 */}
      <div className="px-4 py-4 bg-gray-100 rounded-lg animate-pulse h-32"></div>
    </div>
  )
}
