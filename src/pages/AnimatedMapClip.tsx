import { useEffect, useRef } from "react";
import gsap from "gsap";

const MAP_PATHS = {
  cameroon:
    "M305 205 L300 198 L295 192 L290 185 L287 178 L286 170 L288 163 L293 158 L300 155 L307 154 L313 157 L318 162 L322 169 L324 177 L325 186 L324 195 L321 203 L317 210 L311 215 Z",

  africa:
    "M240 35 L325 50 L380 120 L395 215 L365 310 L305 365 L235 380 L185 345 L145 265 L155 165 L195 85 Z",

  world:
    "M200 40 C90 40 40 120 40 200 C40 300 120 360 200 360 C300 360 360 300 360 200 C360 120 300 40 200 40 Z",
};


interface Props {
  image: string;
  className?: string; // make it optional
}

export default function AnimatedMapClip({ image }: Props) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
  if (!pathRef.current) return;

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

  tl.to(pathRef.current, {
    duration: 1.8,
    attr: { d: MAP_PATHS.africa },
    ease: "power2.inOut",
  })
    .to(pathRef.current, {
      duration: 1.8,
      attr: { d: MAP_PATHS.world },
      ease: "power2.inOut",
    })
    .to(pathRef.current, {
      duration: 1.8,
      attr: { d: MAP_PATHS.cameroon },
      ease: "power2.inOut",
    });

  return () => {
    tl.kill();
  };
}, []);


  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full h-[420px] sm:h-[520px]"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id="mapClip">
          <path ref={pathRef} d={MAP_PATHS.cameroon} />
        </clipPath>
      </defs>

      <image
        href={image}
        width="400"
        height="400"
        clipPath="url(#mapClip)"
        preserveAspectRatio="xMidYMid slice"
      />
    </svg>
  );
}
