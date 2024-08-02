"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function VoiceRec() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transcripts, setTranscripts] = useState<string[]>(() => {
    const savedTranscripts = localStorage.getItem("transcripts");
    return savedTranscripts ? JSON.parse(savedTranscripts) : [];
  });

  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      const { transcript } = event.results[event.results.length - 1][0];
      console.log(event.results);
      setTranscript(transcript);
    };

    recognitionRef.current.start();
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecordingComplete(true);
      const updatedTranscripts = [...transcripts, transcript];
      setTranscripts(updatedTranscripts);
      localStorage.setItem("transcripts", JSON.stringify(updatedTranscripts));
      setTranscript("");
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-screen w-full bg-black text-white p-4">
      <div className="w-full md:w-3/4 md:pr-4">
        {(isRecording || transcript) && (
          <motion.div
            className="w-full rounded-md border border-gray-700 p-6 bg-gray-900 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-1">
                <p className="text-lg font-medium">
                  {recordingComplete ? "Recorded" : "Recording"}
                </p>
                <p className="text-sm text-gray-400">
                  {recordingComplete
                    ? "Thanks for talking."
                    : "Start speaking..."}
                </p>
              </div>
              {isRecording && (
                <div className="rounded-full w-4 h-4 bg-white animate-pulse" />
              )}
            </div>
            {transcript && (
              <div className="border border-gray-600 rounded-md p-4 bg-gray-800">
                <p className="text-gray-300">{transcript}</p>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex justify-center mt-10">
          <button
            onClick={handleToggleRecording}
            className="flex items-center justify-center bg-gray-700 hover:bg-gray-800 rounded-full w-20 h-20 focus:outline-none shadow-lg transition-transform transform hover:scale-110"
          >
            <span className="text-white text-lg font-medium">
              {isRecording ? "" : "SPEAK"}
            </span>
          </button>
        </div>
      </div>

      <div className="w-full md:w-1/4 md:pl-4 md:border-l border-gray-700 mt-4 md:mt-0">
        <h2 className="text-xl font-semibold mb-4">Transcripts</h2>
        <div className="space-y-2">
          {transcripts.map((item, index) => (
            <div
              key={index}
              className="border border-gray-600 rounded-md p-2 bg-gray-900"
            >
              <p className="text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
