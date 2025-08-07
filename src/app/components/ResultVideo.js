"use client";
import TranscriptionItem from "./TranscriptionItem";

import "../styles/fonts.css";

import { useEffect, useRef, useState } from "react";
import SparklesIcon from "./SparklesIcon";
import { transcriptionItemstoSrt } from "./libs/awsTranscriptionsHelpers";
import { promise } from "aws-crt";
import { resolve } from "styled-jsx/css";
//import edosz from 'src/fonts/edosz.ttf';

export default function ResultVideo({ filename, TranscriptionItem }) {
  const videoUrl =
    "https://didar-ultimate-captions.s3.amazonaws.com/" + filename;
  const [loaded, setLoaded] = useState(false);
  const [primarycolour, setPrimaryColour] = useState("#FFFFFF");
  const [OutlineColour, setOutlineColour] = useState("#000000");
  const [progress, setProgress]=useState(1);
  const videoRef = useRef(null);
  const ffmpegRef = useRef(null);

  useEffect(() => {
    videoRef.current.src = videoUrl;

    // Don't load ffmpeg here!
  }, [filename]);

  const loadFFmpeg = async () => {
    if (typeof window !== "undefined" && !ffmpegRef.current) {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL, fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
      ffmpegRef.current = { ffmpeg, toBlobURL, fetchFile };
      await ffmpeg.writeFile(
        "Roboto-Bold.ttf",
        await fetchFile("Roboto-Bold.ttf")
      );
      setLoaded(true);
    }
  };

  function toFFmpegColour(rgb) {
    const bgr = rgb.slice(5,7) + rgb.slice(3,5) + rgb.slice(1,3);
    return "&H" + bgr + "&";
  }

  const transcode = async () => {
    if (!loaded) await loadFFmpeg();
    const { ffmpeg, fetchFile } = ffmpegRef.current;
    const srt = transcriptionItemstoSrt(TranscriptionItem);
    await ffmpeg.writeFile(filename, await fetchFile(videoUrl));
    await ffmpeg.writeFile("subs.srt", srt);
    videoRef.current.src = videoUrl;
    await new Promise((resolve, reject) =>{
      videoRef.current.onloadedmetadata=resolve;
    });
    const duration=videoRef.current.duration;
    console.log(duration);

    console.log(srt);
    await ffmpeg.writeFile(
      "/tmp/Roboto-Bold.ttf",
      await fetchFile("/fonts/Roboto-Bold.ttf")
    );

    ffmpeg.on("log", ({ message }) => {
      console.log(message);
      const regexResult= /time=([0-9:.]+)/.exec(message);
      if(regexResult && regexResult?.[1]){
        const howMuchIsDone=regexResult?.[1];
        const [hours, minutes, seconds]=howMuchIsDone.split(':');
        const doneTotalSeconds=hours * 3600 + minutes * 60 + seconds;
        const videoProgress= doneTotalSeconds/duration;
        setProgress(videoProgress);
      }
    });
    await ffmpeg.exec([
      "-i",
      filename,
      "-preset",
      "ultrafast",
      "-vf",
      `subtitles=subs.srt:fontsdir=/tmp:force_style='FontName=Roboto Bold,FontSize=20,PrimaryColour=${toFFmpegColour(
        primarycolour
      )},OutlineColour=${toFFmpegColour(OutlineColour)},MarginV=60'`,
      "output.mp4",
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    videoRef.current.src = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );
    setProgress(1);
  };

  return (
    <>
      <div className="mb-4">
        <button
          onClick={transcode}
          className="bg-green-600 py-2 px-6 rounded-full inline-flex gap-2 border-2 border-purple-700/50 cursor-pointer"
        >
          <SparklesIcon />
          <span>Apply Captions</span>
        </button>
      </div>
      <div>
        Primary Colour:
        <input
          type="color"
          
          value={primarycolour}
          onChange={(ev) => setPrimaryColour(ev.target.value)}
        ></input>
        <br />
        Outline Colour:
        <input
          type="color"
          value={OutlineColour}
          onChange={(ev) => setOutlineColour(ev.target.value)}
        ></input>
      </div>
      <div className="rounded-xl overflow-hidden relative">
        {progress && progress < 1 && (
          <div className="absolute inset-0 bg-black/80 flex items-center">
            <div className="w-full text-center">
              <div className="bg-gradientFrom/50 mx-8 rounded-lg overflow-hidden relative">
                <div className="bg-gradientFrom h-8"
                     style={{width:progress * 100+'%'}}>
                  <h3 className="text-white text-xl absolute inset-0 py-1">
                    {parseInt(progress * 100)}%
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}
        <video data-video={0} ref={videoRef} controls className="w-full max-w-4xl h-auto"></video>
      </div>
    </>
  );
}
