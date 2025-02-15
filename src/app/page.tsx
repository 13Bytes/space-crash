import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="bg-gray-900 text-white">
      <div className="mx-auto w-dvw px-4 py-32 lg:flex h-dvh lg:items-center">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl mt-10"
          >
            SPACE CRASH
          </h1>

          <p className="mx-auto mt-4 max-w-xl sm:text-xl/relaxed">
            The ultimate zero-g PvP Space Battle!
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              className="block w-full rounded-sm border border-blue-600 bg-blue-600 shadow-sm  px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-white focus:ring-3 focus:outline-hidden sm:w-auto"
              href="/game"
            >
              PLAY
            </Link>
          </div>

          <div className="mt-20 flex flex-row flex-wrap justify-center gap-20">
            <div className="flex flex-col justify-center gap-2">
              Player 1
              <div>
                <kbd className="kbd">w</kbd>
                <div className="my-1 flex w-full justify-center gap-10">
                  <kbd className="kbd">a</kbd>
                  <kbd className="kbd">d</kbd>
                </div>
              </div>
            </div >

            <div className="flex flex-col justify-center gap-2">
              Player 2
              <div>
                <kbd className="kbd">▲</kbd>
                <div className="my-1 flex w-full justify-center gap-10">
                  <kbd className="kbd">◀︎</kbd>
                  <kbd className="kbd">▶︎</kbd>
                </div>
              </div>
            </div >
          </div>
        </div>
      </div>
    </section >

  );
}
