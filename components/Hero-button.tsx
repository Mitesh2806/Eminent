'use client';

import Link from 'next/link'
import React from 'react';

const HeroButton = ({
  label,
  href,
  bgColor,
  spanBgColor,
}:{ label: string, href: string, bgColor?: string, spanBgColor?: string}) => {
  return (
    <Link href={href}>
      <button className={`group ${bgColor} font-bold p-0 rounded-[5px]`}>
        <span
          className={`${spanBgColor} block py-6 px-8 border border-black rounded-[5px] -translate-x-[4px] -translate-y-[4px] transition-transform duration-300 ease-[cubic-bezier(0.7,0,0.2,1)]
          group-hover:-translate-x-[8px] group-hover:-translate-y-[8px]`}
        >
          {label}
        </span>
      </button>
    </Link>
  );
};

export default HeroButton;
