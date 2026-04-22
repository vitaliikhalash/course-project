"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { IconButton } from "@/components/icon-button";
const SLIDES = [
  {
    src: "/images/hero-bg-1.jpg",
    title: "Ваш цифровий банк",
    subtitle: "Управляйте фінансами зручно та безпечно",
    author: "SHVETS production",
    authorLink: "https://www.pexels.com/@30353109/",
    photoLink:
      "https://www.pexels.com/photo/a-person-s-hands-holding-a-card-and-a-cell-phone-7545218/",
  },
  {
    src: "/images/hero-bg-2.jpg",
    title: "Швидкі перекази",
    subtitle: "Переказуйте кошти між картками або на будь-яку картку",
    author: "Kindel Media",
    authorLink: "https://www.pexels.com/@10715710/",
    photoLink: "https://www.pexels.com/photo/monthly-budget-planning-7054399/",
  },
  {
    src: "/images/hero-bg-3.jpg",
    title: "Безпека та контроль",
    subtitle: "Керування всіма операціями в одному особистому кабінеті",
    author: "Kindel Media",
    authorLink: "https://www.pexels.com/@10715710/",
    photoLink:
      "https://www.pexels.com/photo/person-writing-on-white-paper-7979428/",
  },
];
export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlide = SLIDES[currentSlide];
  const handlePrev = () =>
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 10000);
    return () => clearInterval(interval);
  }, [currentSlide]);
  return (
    <div className="relative h-[25rem] self-stretch overflow-hidden">
      <div
        style={
          {
            "--slide": currentSlide,
          } as CSSProperties
        }
        className="absolute inset-0 flex translate-x-[calc(var(--slide)*-100%)] transition-transform duration-300 ease-in-out"
      >
        {SLIDES.map((slide, index) => (
          <div
            key={index}
            className="relative h-full w-full shrink-0 overflow-hidden"
          >
            <Image
              src={slide.src}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="(max-width: 1064px) 100vw, 1064px"
              className="scale-110 object-cover object-top blur-[2px]"
            />

            <div className="absolute inset-0" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-between p-4">
        <div className="flex w-full flex-1 items-center justify-between gap-5">
          <IconButton
            icon="/icons/arrow-left.svg"
            onClick={handlePrev}
            aria-label="Попередній слайд"
          />

          <div className="text-ink-strong flex flex-col items-center gap-2 text-center">
            <b className="text-[clamp(1.5rem,5vw,3rem)] leading-[120%] tracking-[-0.03em]">
              {activeSlide.title}
            </b>
            <div className="text-[clamp(1rem,3vw,1.5rem)] leading-[120%]">
              {activeSlide.subtitle}
            </div>
          </div>
          <IconButton
            icon="/icons/arrow-right.svg"
            onClick={handleNext}
            aria-label="Наступний слайд"
          />
        </div>
        <b className="text-ink-strong text-xs leading-[120%]">
          {`Фото від `}
          <a
            href={activeSlide.authorLink}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <span className="underline">{activeSlide.author}</span>
          </a>
          {` з `}
          <a
            href={activeSlide.photoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <span className="underline">Pexels</span>
          </a>
        </b>
      </div>
    </div>
  );
};
