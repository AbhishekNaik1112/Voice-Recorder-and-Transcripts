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
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("record");
  const [userName, setUserName] = useState<string | null>(null);

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

    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      recognitionRef.current.start();
    });
  };

  useEffect(() => {
    const name = prompt("Please enter your name:");
    if (name) {
      setUserName(name);
    }
  }, []);

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
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-900 text-white p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          {userName && (
            <h1 className="text-xl sm:text-2xl font-bold">Hi, {userName}!</h1>
          )}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              className={`px-4 py-2 rounded-t-md ${
                activeTab === "record" ? "bg-gray-800" : "bg-gray-700"
              }`}
              onClick={() => setActiveTab("record")}
            >
              Record
            </button>
            <button
              className={`px-4 py-2 rounded-t-md ${
                activeTab === "transcripts" ? "bg-gray-800" : "bg-gray-700"
              }`}
              onClick={() => setActiveTab("transcripts")}
            >
              Transcripts
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-4 sm:p-6 md:p-8 lg:p-10 rounded-md shadow-lg">
          {activeTab === "record" && (
            <div>
              {(isRecording || transcript) && (
                <motion.div
                  className="w-full rounded-md border border-gray-700 p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-900 shadow-lg mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg md:text-xl font-medium">
                        {recordingComplete ? "Recorded" : "Recording"}
                      </p>
                      <p className="text-sm sm:text-base text-gray-400">
                        {recordingComplete
                          ? "Thanks for talking."
                          : "Start speaking..."}
                      </p>
                    </div>
                    {isRecording && (
                      <div className="rounded-full w-4 h-4 bg-white animate-pulse mt-4 md:mt-0" />
                    )}
                  </div>
                  {transcript && (
                    <div className="border border-gray-600 rounded-md p-4 bg-gray-800 mt-4">
                      <p className="text-gray-300">{transcript}</p>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex justify-center mt-10">
                <button
                  onClick={handleToggleRecording}
                  className="flex items-center justify-center bg-red-700 hover:bg-red-800 rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 focus:outline-none shadow-lg transition-transform transform hover:scale-110"
                >
                  <span className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-medium">
                    {isRecording ? "STOP" : "SPEAK"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "transcripts" && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">
                Transcripts
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
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
          )}
        </div>
      </div>
    </div>
  );
}
