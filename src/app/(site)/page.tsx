import { auth } from "@/auth";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default async function Home() {
  return (
    <section className="relative bg-black h-full">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]",
        )}
      >
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />
        <div className="grid grid-cols-2 h-full">
          <section className="text-[#eeee] flex justify-center items-center">
            <div>
              <h1 className="text-7xl font-bold">
                Raybox
              </h1>
              <br />
              <p>come store ideas</p>
            </div>
          </section>
          <section>
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/unicorn.mp4" type="video/mp4" />
            </video>
            {/* <img
              src={'/vortex_cube2.png'}
              className="w-full h-full object-contain"
            /> */}
          </section>
        </div>
      </div>
    </section>

  );
}
