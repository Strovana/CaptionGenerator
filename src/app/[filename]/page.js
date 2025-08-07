"use client";
import axios from "axios";
import { useEffect, useRef, use, useState } from "react";
import { clearTranscriptionItems } from "../components/libs/awsTranscriptionsHelpers";
import ResultVideo from "../components/ResultVideo";
import TranscriptionEditor from "../components/TranscriptionEditor";

export default function FilePage({ params }) {
  const { filename } = use(params);
  const calledRef = useRef(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [awsTranscriptionItem, setAwsTranscriptionItems] = useState([]);

 


  useEffect(() => {
    getTranscription();
  }, [filename]);

  const retriesRef = useRef(0);

function getTranscription() {
  if (!filename || retriesRef.current > 20) return;

  setIsFetchingInfo(true);

  axios
    .get("/api/transcribe?filename=" + filename)
    .then((response) => {
      setIsFetchingInfo(false);
      const status = response.data?.status;
      const transcription = response.data?.transcription;

      if (status === "IN_PROGRESS") {
        setIsTranscribing(true);
        retriesRef.current += 1;
        setTimeout(() => getTranscription(), 3000);
      } else {
        setIsTranscribing(false);
        setAwsTranscriptionItems(
          clearTranscriptionItems(transcription.results.items)
        );
      }
    })
    .catch((err) => {
      console.error("Transcribe error:", err);
      setIsFetchingInfo(false);
    });
}


  

  if (isTranscribing) {
    return <div>Transcribing your video...</div>;
  }

  if (isFetchingInfo) {
    return <div>Fetching information...</div>;
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-8 sm:gap-16">
        <div className="">
          <h2 className="text-2xl mb-4 text-white/60">Transcription </h2>
          <TranscriptionEditor 
            awsTranscriptionItem={awsTranscriptionItem}
            setAwsTranscriptionItems={setAwsTranscriptionItems}/>
          
        </div>
        <div>
          <h2 className="text-2xl mb-4 text-white/60">Result</h2>
          <ResultVideo filename={filename} 
            TranscriptionItem={awsTranscriptionItem}
            />
          
        </div>
      </div>
    </div>
  );
}
