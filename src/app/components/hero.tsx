"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { TypeAnimation } from "react-type-animation";
import Particles from "@tsparticles/react";
import { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function Hero() {
  const [isLoading, setIsLoading] = useState(false);
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(
    async (container: Container | undefined) => {
      await console.log("Particles loaded:", container);
    },
    []
  );

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  const particlesOptions: ISourceOptions = {
    background: {
      color: {
        value: "#000000",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: { enable: true },
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 150,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          value_area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  return (
    <div className="relative flex flex-col bg-black text-white items-center justify-center min-h-screen overflow-hidden">
      {init && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={particlesOptions}
          className="absolute inset-0 z-0"
        />
      )}
      <div className="relative z-10 max-w-xl w-full text-center px-4">
        <h2 className="font-extrabold text-[35px] lg:text-[5vw] leading-none lg:leading-[1.1] tracking-tighter text-center font-sans">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue">
            Folk
          </span>{" "}
          Your Brain
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue">
            Build
          </span>{" "}
          Second Brain
        </h2>

        <p className="text-sm lg:text-lg text-gray-400 mt-5">
          記憶・知識・思いつきを入れて、第二の脳を作ろう
        </p>

        <div className="mt-10">
          <Button
            onClick={handleSignIn}
            variant="outline"
            disabled={isLoading}
            className="w-full max-w-[250px] lg:max-w-xs mx-auto shadow-md hover:shadow-lg transition-all lg:text-base py-4 lg:py-6"
          >
            {isLoading ? (
              <Loader2 className="!w-4 !h-4 lg:!w-5 lg:!h-5 animate-spin" />
            ) : (
              <FcGoogle className="!w-4 !h-4 lg:!w-5 lg:!h-5" />
            )}
            Google で始めよう
          </Button>
        </div>

        <div className="fixed top-0 left-0 w-full p-4">
          <div className="flex items-start gap-4">
            <Image
              src="/profile.jpg"
              alt="開発者"
              width={40}
              height={40}
              className="rounded-full shadow-md border border-white/20 mt-1"
              priority
            />
            <div className="bg-gray-800 rounded-lg p-3 text-left text-sm shadow-md w-full max-w-[400px] relative">
              <TypeAnimation
                className="whitespace-pre-wrap"
                sequence={[
                  `頭の中がいつもごちゃごちゃしてる。
本で読んだこと、人から聞いた話、思いつき、どれも大切なのに思い出せない。
Second Brainは、情報を整理し、つなげることで思考を拡張するプロダクトです。
まだ開発途中ですが、ぜひ使ってみてください。`,
                ]}
                speed={15}
                cursor={true}
                style={{ display: "inline-block" }}
              />
              <div className="absolute left-[-9px] top-[14px] w-0 h-0 border-t-[10px] border-t-transparent border-r-[10px] border-r-gray-800 border-b-[10px] border-b-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
