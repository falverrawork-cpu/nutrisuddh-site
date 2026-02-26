import type { CSSProperties, ImgHTMLAttributes } from "react";

type AppImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

export default function Image({ fill, style, alt, ...props }: AppImageProps) {
  const { priority: _priority, quality: _quality, ...imgProps } = props;
  const imageStyle: CSSProperties = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style
      }
    : { ...style };

  return <img alt={alt ?? ""} {...imgProps} style={imageStyle} />;
}
