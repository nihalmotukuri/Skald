import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";
import { BellIcon, Share2Icon } from "lucide-react";

// import { Calendar } from "@/components/ui/calendar";
// import { cn } from "@/lib/utils";
// import AnimatedBeamMultipleOutputDemo from "@/registry/example/animated-beam-multiple-outputs";
import Integrations from "./Integrations";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
// import { Marquee } from "@/components/magicui/marquee";

// const files = [
//   {
//     name: "bitcoin.pdf",
//     body: "Bitcoin is a cryptocurrency invented in 2008 by an unknown person or group of people using the name Satoshi Nakamoto.",
//   },
//   {
//     name: "finances.xlsx",
//     body: "A spreadsheet or worksheet is a file made of rows and columns that help sort data, arrange data easily, and calculate numerical data.",
//   },
//   {
//     name: "logo.svg",
//     body: "Scalable Vector Graphics is an Extensible Markup Language-based vector image format for two-dimensional graphics with support for interactivity and animation.",
//   },
//   {
//     name: "keys.gpg",
//     body: "GPG keys are used to encrypt and decrypt email, files, directories, and whole disk partitions and to authenticate messages.",
//   },
//   {
//     name: "seed.txt",
//     body: "A seed phrase, seed recovery phrase or backup seed phrase is a list of words which store all the information needed to recover Bitcoin funds on-chain.",
//   },
// ];

const features = [
  {
    Icon: FileTextIcon,
    name: "Notes",
    description: "We automatically save your files as you type.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
    <div></div>
    ),
  },
  {
    Icon: BellIcon,
    name: "Task Management",
    description: "Sort your day to day works with our to-do list",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
    <div></div>
    ),
  },
  {
    Icon: Share2Icon,
    name: "Integrations",
    description: "Supporting you & your daily - life tasks and works through Skald",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
    <Integrations className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: CalendarIcon,
    name: "Calendar",
    description: "Use the calendar to filter your tasks by date.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    background: (
    <div></div>
    ),
  },
];

const FeaturesBentoGrid = () => {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}

export default FeaturesBentoGrid