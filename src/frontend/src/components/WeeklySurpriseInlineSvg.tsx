interface WeeklySurpriseInlineSvgProps {
  svgString: string;
  className?: string;
}

export default function WeeklySurpriseInlineSvg({
  svgString,
  className = "",
}: WeeklySurpriseInlineSvgProps) {
  return (
    <div
      className={`inline-svg-wrapper ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted SVG strings from internal data only
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
