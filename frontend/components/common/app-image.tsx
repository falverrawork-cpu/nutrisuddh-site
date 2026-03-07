import type { CSSProperties, ImgHTMLAttributes } from "react";
import { getMediaUrl } from "@/lib/utils";

type AppImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

export default function Image({ fill, style, alt, ...props }: AppImageProps) {
  const { priority, quality: _quality, loading, decoding, src, ...imgProps } = props;
  const imageStyle: CSSProperties = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style
      }
    : { ...style };

  return (
    <img
      alt={alt ?? ""}
      {...imgProps}
      src={typeof src === "string" ? getMediaUrl(src) : src}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding ?? "async"}
      style={imageStyle}
    />
  );
}
