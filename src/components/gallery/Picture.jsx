import Image from "next/image";
export default function Picture({ asset, ...props }) {
  return (
    <Image
      src={asset.src}
      alt={asset.title}
      fill
      sizes="(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 24vw"
      {...props}
    />
  );
}
