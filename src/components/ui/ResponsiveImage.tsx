type ImagenResponsivaProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes = "100vw",
  priority = false,
  className,
}: ImagenResponsivaProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
