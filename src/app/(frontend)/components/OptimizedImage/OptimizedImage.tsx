import Image from 'next/image'

type OptimizedImageProps = {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  fill?: boolean
  fetchPriority?: 'high' | 'low' | 'auto'
}

function canOptimize(src: string): boolean {
  return Boolean(src) && !src.startsWith('data:')
}

export default function OptimizedImage({
  src,
  alt,
  className,
  width = 800,
  height = 500,
  priority = false,
  sizes,
  fill = false,
  fetchPriority,
}: OptimizedImageProps) {
  const resolvedFetchPriority = fetchPriority ?? (priority ? 'high' : 'low')

  if (!canOptimize(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={resolvedFetchPriority}
        decoding="async"
        width={fill ? undefined : width}
        height={fill ? undefined : height}
      />
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        className={className}
        fill
        sizes={sizes ?? '100vw'}
        priority={priority}
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
    />
  )
}
