import Image from "next/image";
import Link from "next/link";
import { CodingIcon } from "./icons/coding";

export default function Home() {
  return (
    <section className="">
      <div className="mx-auto w-dvw px-4 pt-32 flex flex-col h-dvh items-center overflow-auto">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl mt-10"
          >
            SPACE CRASH
          </h1>

          <p className="mx-auto mt-4 max-w-xl font-medium sm:text-xl/relaxed">
            The ultimate zero-g PvP Space Battle!
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              className="block w-full rounded-sm border border-blue-600 bg-blue-600 shadow-sm  px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-white focus:ring-3 focus:outline-hidden sm:w-auto"
              href="/game"
            >
              PLAY
            </Link>
          </div>

          <div className="mt-20 flex flex-row flex-wrap justify-center gap-20">
            <div className="flex flex-col justify-center gap-2">
              <span className="font-bold">Player 1</span>
              <Image src="/rocket-fire-purple.svg" alt={""} width={70} height={50} className="-rotate-90 self-center m-2"></Image>
              <div className="">

                <kbd className="kbd">w</kbd>
                <div className="my-1 flex w-full justify-center gap-10">
                  <kbd className="kbd">a</kbd>
                  <kbd className="kbd">d</kbd>
                </div>
              </div>
            </div >

            <div className="flex flex-col justify-center gap-2">
              <span className="font-bold">Player 2</span>
              <Image src="/rocket-fire-green.svg" alt={""} width={70} height={50} className="-rotate-90 self-center m-2"></Image>
              <div className="">
                <kbd className="kbd">▲</kbd>
                <div className="my-1 flex w-full justify-center gap-10">
                  <kbd className="kbd">◀︎</kbd>
                  <kbd className="kbd">▶︎</kbd>
                </div>
              </div>
            </div >
          </div>
          <div className="mt-10 flex flex-row flex-wrap justify-center gap-20">
            Which player will be the last one flying?
          </div>
        </div>

        <div className="flex flex-grow flex-row align-bottom justify-center text-neutral-content my-3 gap-8">
          <div className="self-end flex flex-row font-extralight text-gray-700 gap-1">
            <div>
              <CodingIcon />
            </div>
            <div>
              by <Link href="https://13bytes.de/" target="_blank" >13 Bytes</Link>
            </div>
          </div>
        </div>
      </div>
    </section >

  );
}
